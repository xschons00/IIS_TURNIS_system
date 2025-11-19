<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    /**
     * Resource-style method: list all players.
     */

    public function GetAllPlayers()
    {
        return User::all();
    }

    /**
     * Resource-style method: store a new player.
     */


    public function SavePlayer(Request $request)
    {
        return User::create($request->all());
    }

    /**
     * Resource-style method: show a single player.
     */


    public function GetPlayer(string $id)
    {
        return User::find($id);
    }

    public function UpdatePlayer(Request $request, string $id)
    {
        $player = User::find($id);

        if ($player) {
            $player->update($request->all());
            return $player;
        }

        return null;
    }

    /**
     * Resource-style method: delete a player.
     */

    public function DeletePlayer(string $id)
    {
        $player = User::find($id);

        if ($player) {
            $player->delete();
            return true;
        }

        return false;
    }
}
