<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function GetAllPlayers()
    {
        return User::all();
    }

    public function SavePlayer(Request $request)
    {
        return User::create($request->all());
    }

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
