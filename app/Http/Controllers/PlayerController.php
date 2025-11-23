<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\ApiResponse;
use Illuminate\Support\Facades\Hash;

class PlayerController 
{
    use ApiResponse;

    /**
     * Resource-style method: list all players.
     */

    public function GetAllPlayers(): JsonResponse
    {
        return $this->respondWithMessage('Players retrieved', User::all());
    }

    /**
     * Resource-style method: store a new player.
     */


    public function SavePlayer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_name' => 'required|string|max:255|unique:users,user_name',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);
        //hash password before saving
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return $this->respondWithMessage('Player created', $user, 201);
    }

    /**
     * Resource-style method: show a single player.
     */


    public function GetPlayer(string $id): JsonResponse
    {
        $player = User::find($id);

        if (! $player) {
            return $this->respondWithMessage('User not found', null, 404);
        }

        return $this->respondWithMessage('Player retrieved', $player);
    }

    public function UpdatePlayer(Request $request, string $id): JsonResponse
    {
        $player = User::find($id);

        if (!$player) {
            return $this->respondWithMessage('User not found', null, 404);
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
        //hash password before saving
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        $player->update($validated);

        return $this->respondWithMessage('Player updated', $player);
    }

    /**
     * Update own profile (authenticated user)
     */
    public function UpdateOwnProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,user_ID',
            'user_name' => 'sometimes|string|max:255',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'faculty' => 'sometimes|string|in:ENGINEERING,CHEMISTRY,COMPUTER_SCIENCE,BUSINESS,ARTS,MATHEMATICS,PHYSICS',
        ]);

        $user = User::find($validated['user_id']);

        if (!$user) {
            return $this->respondWithMessage('User not found', null, 404);
        }

        $user->update([
            'first_name' => $validated['first_name'] ?? $user->first_name,
            'last_name' => $validated['last_name'] ?? $user->last_name,
            'faculty' => $validated['faculty'] ?? $user->faculty,
        ]);

        return $this->respondWithMessage('Profile updated', $user);
    }

    /**
     * Resource-style method: delete a player.
     */

    public function DeletePlayer(string $id): JsonResponse
    {
        $player = User::find($id);

        if ($player) {
            $player->delete();
            return $this->respondWithMessage('Player deleted');
        }

        return $this->respondWithMessage('User not found', null, 404);
    }
}
