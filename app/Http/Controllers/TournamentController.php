<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class TournamentController extends Controller
{
    /**
     * Resource-style method: list all tournaments.
     */
    public function GetAllTournaments()
    {
        return Event::all();
    }

    /**
     * Resource-style method: store a new tournament.
     */

    public function SaveTournament(Request $request)
    {
        $data = $request->all();
        $data['event_state'] = $data['event_state'] ?? 'NEW';

        return Event::create($data);
    }

    /**
     * Resource-style method: show a single tournament.
     */
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

    /**
     * Resource-style method: delete a tournament.
     */

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
