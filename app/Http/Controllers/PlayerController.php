<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlayerController 
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
        $validated = $request->validate([
            'user_name' => 'required|string|max:255|unique:users,user_name',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
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

        if (!$player) {
            return null;
        }

        $validated = $request->validate([
            'user_name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('users', 'user_name')->ignore($player->user_ID, 'user_ID'),
            ],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($player->user_ID, 'user_ID'),
            ],
            'password' => ['sometimes', 'string', 'min:6'],
        ]);

        $player->update($validated);

        return $player;
    }

    /**
     * Update own profile (authenticated user)
     */
    public function UpdateOwnProfile(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,user_ID',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'faculty' => 'sometimes|string|in:ENGINEERING,CHEMISTRY,COMPUTER_SCIENCE,BUSINESS,ARTS,MATHEMATICS,PHYSICS',
        ]);

        $user = User::find($validated['user_id']);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update([
            'first_name' => $validated['first_name'] ?? $user->first_name,
            'last_name' => $validated['last_name'] ?? $user->last_name,
            'faculty' => $validated['faculty'] ?? $user->faculty,
        ]);

        return response()->json($user);
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
