<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\ParticipantCount;


Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/logout', [AuthController::class, 'logout']);
Route::get('auth/me', [AuthController::class, 'me']);

// Players
Route::get('players', [PlayerController::class, 'GetAllPlayers']);
Route::post('players', [PlayerController::class, 'SavePlayer']);
Route::get('players/{id}', [PlayerController::class, 'GetPlayer']);


// Teams
Route::get('teams', [TeamController::class, 'GetAllTeams']);
Route::post('teams', [TeamController::class, 'SaveTeam']);
Route::get('teams/{id}', [TeamController::class, 'GetTeam']);


// Tournaments
Route::get('tournaments', [TournamentController::class, 'GetAllTournaments']);
Route::post('tournaments', [TournamentController::class, 'SaveTournament']);
Route::get('tournaments/{id}', [TournamentController::class, 'GetTournament']);
Route::get('tournaments/{id}/participants/count', [ParticipantCount::class, 'GetParticipantCount']);

Route::get('statistics', [StatisticsController::class, 'index']);

// Admin-only routes
Route::middleware('admin')->group(function () {
    Route::put('tournaments/{id}', [TournamentController::class, 'UpdateTournament']);
    Route::delete('tournaments/{id}', [TournamentController::class, 'DeleteTournament']);
    Route::put('teams/{id}', [TeamController::class, 'update']);
    Route::delete('teams/{id}', [TeamController::class, 'DeleteTeam']);
    Route::put('players/{id}', [PlayerController::class, 'UpdatePlayer']);
    Route::delete('players/{id}', [PlayerController::class, 'DeletePlayer']);
});