<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TeamMembersController extends Controller
{
    /**
     * GET /api/teams/{id}/members/count
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