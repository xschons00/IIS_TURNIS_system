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



}