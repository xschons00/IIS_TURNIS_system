<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ParticipantsController;
use App\Http\Controllers\TeamMembersController;
use App\Http\Middleware\isAdmin;
use App\Http\Middleware\isTeamLeader;
use App\Http\Middleware\isEventLeader;
use App\Http\Controllers\Filters\PlayerFilter;
use App\Http\Controllers\Filters\EventFilter;
use App\Http\Controllers\Filters\TeamFilter;

// Authentication
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/logout', [AuthController::class, 'logout']);
Route::get('auth/me', [AuthController::class, 'me']);

// Players
Route::get('players', [PlayerController::class, 'GetAllPlayers']);
Route::post('players', [PlayerController::class, 'SavePlayer']);
Route::get('players/{id}', [PlayerController::class, 'GetPlayer']);

// Authenticated user routes (no middleware - auth check inside controller)
Route::put('profile', [PlayerController::class, 'UpdateOwnProfile']);


// Teams
Route::get('teams', [TeamController::class, 'GetAllTeams']);
Route::post('teams', [TeamController::class, 'SaveTeam']);
Route::get('teams/{id}', [TeamController::class, 'GetTeam']);

// Team members
Route::get('teams/{id}/members', [TeamMembersController::class, 'GetTeamMembers']);
Route::get('teams/{id}/members/count', [TeamMembersController::class, 'GetTeamMemberCount']);
 

// events
Route::get('events', [EventController::class, 'GetAllevents']);
Route::post('events', [EventController::class, 'Saveevent']);
Route::get('events/{id}', [EventController::class, 'Getevent']);

// Participants
Route::get('events/{id}/participants', [ParticipantsController::class, 'GetParticipants']);
Route::get('events/{id}/participants/count', [ParticipantsController::class, 'GetParticipantCount']);

Route::get('statistics', [StatisticsController::class, 'index']);

// Admin-only routes
Route::middleware([isAdmin::class])->group(function () {
    Route::put('events/{id}', [EventController::class, 'Updateevent']);
    Route::delete('events/{id}', [EventController::class, 'Deleteevent']);
    Route::put('teams/{id}', [TeamController::class, 'update']);
    Route::delete('teams/{id}', [TeamController::class, 'DeleteTeam']);
    Route::put('players/{id}', [PlayerController::class, 'UpdatePlayer']);
    Route::delete('players/{id}', [PlayerController::class, 'DeletePlayer']);
});
// Event leader and Team leader routes
Route::middleware([isTeamLeader::class])->group(function () {
    Route::put('teams/{id}', [TeamController::class, 'update']);
    Route::delete('teams/{id}', [TeamController::class, 'DeleteTeam']);
});
Route::middleware([isEventLeader::class])->group(function () {
    Route::put('events/{id}', [EventController::class, 'Updateevent']);
    Route::delete('events/{id}', [EventController::class, 'Deleteevent']);
});

// Filter routes
Route::get('filters/players', [PlayerFilter::class, 'GetPlayersFilter']);
Route::get('filters/events', [EventFilter::class, 'GetEventsFilter']);
Route::get('filters/teams', [TeamFilter::class, 'GetTeamsFilter']);
