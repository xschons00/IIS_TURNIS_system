<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class TournamentController extends Controller
{
    public function GetAllTournaments()
    {
        return Event::all();
    }

    public function SaveTournament(Request $request)
    {
        Event::create($request->all());
    }

    public function GetTournament(string $id)
    {
        return Event::find($id);
    }

    public function UpdateTournament(Request $request, string $id)
    {
        $tournament = Event::find($id);
        if ($tournament) {
            $tournament->update($request->all());
            return $tournament;
        }
        return null;
    }

    public function DeleteTournament(string $id)
    {
        $tournament = Event::find($id);
        if ($tournament) {
            $tournament->delete();
            return true;
        }
        return false;
    }
}

