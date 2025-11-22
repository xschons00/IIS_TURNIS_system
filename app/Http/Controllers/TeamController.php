<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    /**
     * Resource-style method: list all teams.
     */
    public function index()
    {
        return $this->GetAllTeams();
    }

    public function GetAllTeams()
    {
        return Team::all();
    }

    /**
     * Resource-style method: store a new team.
     */
    public function SaveTeam(Request $request)
    {
        $validated = $request->validate([
            'team_name' => 'required|string|max:255|unique:teams,team_name',
            'ranking' => 'nullable|integer|min:0',
            'team_leader_id' => 'required|exists:users,user_ID',
        ]);

        return Team::create($validated);
    }

    /**
     * Resource-style method: show a single team.
     */

    public function GetTeam(string $id)
    {
        return Team::find($id);
    }

    public function update(Request $request, string $id)
    {
        $team = Team::find($id);

        if (!$team) {
            return null;
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
        ]);

        $team->update($validated);

        return $team;
    }

    /**
     * Resource-style method: delete a team.
     */

    public function DeleteTeam(string $id)
    {
        $team = Team::find($id);

        if ($team) {
            $team->delete();
            return true;
        }

        return false;
    }
}
