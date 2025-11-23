<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\ApiResponse;
use Throwable;

class TeamController 
{
    use ApiResponse;

    /**
     * Resource-style method: list all teams.
     */
    public function index(): JsonResponse
    {
        return $this->GetAllTeams();
    }

    public function GetAllTeams(): JsonResponse
    {
        return $this->respondWithMessage('Teams retrieved', Team::all());
    }

    /**
     * Resource-style method: store a new team.
     */
    public function SaveTeam(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'team_name' => 'required|string|max:255|unique:teams,team_name',
            'ranking' => 'nullable|integer|min:0',
            'team_leader_id' => 'sometimes|exists:users,user_ID',
            'members' => 'sometimes|array',
            'members.*' => 'integer|exists:users,user_ID',
        ]);

        // Resolve leader from payload or authenticated user
        $leaderId = $validated['team_leader_id'] ?? optional($request->user())->user_ID;
        if (! $leaderId) {
            return $this->respondWithMessage('Unauthenticated', null, 401);
        }

        // Always include the leader as a member
        $memberIds = collect($validated['members'] ?? [])
            ->push($leaderId)
            ->unique()
            ->values();

        return DB::transaction(function () use ($validated, $memberIds, $leaderId) {
            $team = Team::create([
                'team_name' => $validated['team_name'],
                'ranking' => $validated['ranking'] ?? 0,
                'team_leader_id' => $leaderId,
            ]);

            // attach/sync members including leader
            $team->members()->sync($memberIds);

            return $this->respondWithMessage('Team created', $team, 201);
        });
    }

    /**
     * Resource-style method: show a single team.
     */

    public function GetTeam(string $id): JsonResponse
    {
        $team = Team::find($id);

        if (! $team) {
            return $this->respondWithMessage('Team not found', null, 404);
        }

        return $this->respondWithMessage('Team retrieved', $team);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $team = Team::find($id);

        if (!$team) {
            return $this->respondWithMessage('Team not found', null, 404);
        }

        $validated = $request->validate([
            'team_name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('teams', 'team_name')->ignore($team->team_ID, 'team_ID'),
            ],
            'ranking' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'team_leader_id' => ['sometimes', 'exists:users,user_ID'],
            'members' => 'sometimes|array',
            'members.*' => 'integer|exists:users,user_ID',
        ]);

        return DB::transaction(function () use ($validated, $team) {
            $team->update($validated);

            if (array_key_exists('members', $validated)) {
                // Always keep leader in the members list
                $leaderId = $validated['team_leader_id'] ?? $team->team_leader_id;
                $memberIds = collect($validated['members'] ?? [])
                    ->push($leaderId)
                    ->unique()
                    ->values();

                $team->members()->sync($memberIds);
            }

            return $this->respondWithMessage('Team updated', $team);
        });
    }

    /**
     * Resource-style method: delete a team.
     */

    public function DeleteTeam(string $id): JsonResponse
    {
        $team = Team::find($id);

        if ($team) {
            $team->delete();
            return $this->respondWithMessage('Team deleted');
        }

        return $this->respondWithMessage('Team not found', null, 404);
    }
}
