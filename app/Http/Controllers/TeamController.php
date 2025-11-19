<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function GetAllTeams()
    {
        return Team::all();
    }

    public function SaveTeam(Request $request)
    {
        return Team::create($request->all());
    }

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
