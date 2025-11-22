<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TeamMembersController extends Controller
{

    /**
     * GET /api/teams/{id}/members
     * Returns list of team members.
     * @return JsonResponse data with team members
     * route::get('/api/teams/{id}/members', [TeamMembersController::class, 'GetTeamMembers']);
     */
    public function GetTeamMembers(Request $request, int $id): JsonResponse
    {
        $team = Team::find($id);

        if (! $team) {
            return response()->json(['message' => 'Team not found'], 404);
        }

        $members = $team->members()->get(['users.user_ID', 'users.user_name', 'first_name', 'last_name',
                                            'faculty', 'ranking']);

        return response()->json([
            'team_id' => $team->team_ID,
            'team_name' => $team->team_name,
            'members' => $members,
        ]);
    }

    /**
     * GET /api/teams/{id}/members/count
     * Returns count of team members.
     * @return JsonResponse data with team member count
     * route::get('/api/teams/{id}/members/count', [TeamMembersController::class, 'GetTeamMemberCount']);
     */
    public function GetTeamMemberCount(Request $request, int $id): JsonResponse
    {
        $team = Team::find($id);

        if (! $team) {
            return response()->json(['message' => 'Team not found'], 404);
        }

        $count = $team->members()->count();

        return response()->json([
            'team_id' => $team->team_ID,
            'team_name' => $team->team_name,
            'members' => $count,
        ]);
    }

    /**
     * POST /api/teams/{id}/members
     * Adds a new member to the team.
     * @return JsonResponse success or error message
     * route::post('/api/teams/{id}/members', [TeamMembersController::class, 'AddTeamMember']);
     */

    public function AddTeamMember(Request $request, int $id): JsonResponse
    {
        $team = Team::find($id);

        if (! $team) {
            return response()->json(['message' => 'Team not found'], 404);
        }

        $validated = $request->validate([
            'user_ID' => 'required|exists:users,user_ID',
        ]);

        // Check if user is already a member
        if ($team->members()->where('users.user_ID', $validated['user_ID'])->exists()) {
            return response()->json(['message' => 'User is already a team member'], 400);
        }

        $team->members()->attach($validated['user_ID']);

        return response()->json(['message' => 'Member added successfully'], 201);
    }
    /**
     * DELETE /api/teams/{id}/members
     * Removes a member from the team.
     * @return JsonResponse success or error message
     * route::delete('/api/teams/{id}/members', [TeamMembersController::class, 'RemoveTeamMember']);
     */
    public function RemoveTeamMember(Request $request, int $id): JsonResponse
    {
        $team = Team::find($id);
        if (! $team) {
            return response()->json(['message' => 'Team not found'], 404);
        }   
        $validated = $request->validate([
            'user_ID' => 'required|exists:users,user_ID',
        ]);
        // Check if user is a member
        if (! $team->members()->where('users.user_ID', $validated['user_ID'])->exists()) {
            return response()->json(['message' => 'User is not a team member'], 400);
        }
        $team->members()->detach($validated['user_ID']);
        return response()->json(['message' => 'Member removed successfully'], 200);
    }

}