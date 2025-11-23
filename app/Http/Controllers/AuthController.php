<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Concerns\ApiResponse;

class AuthController 
{
    use ApiResponse;

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        //hash password before comparing
        //$credentials['password'] = Hash::make($credentials['password']);
        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return $this->respondWithMessage('Invalid credentials', null, 401);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return $this->respondWithMessage('Login successful', [
            'user' => Auth::user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        if (Auth::check()) {
            Auth::logout();
        }

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return $this->respondWithMessage('Logged out');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $this->respondWithMessage('Unauthenticated', null, 401);
        }

        return $this->respondWithMessage('Authenticated user', $user);
    }
}
