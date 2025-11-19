<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

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
        return Team::create($request->all());
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

        if ($team) {
            $team->update($request->all());
            return $team;
        }

        return null;
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
