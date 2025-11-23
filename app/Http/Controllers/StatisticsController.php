<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventMatch;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\ApiResponse;

class StatisticsController 
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->respondWithMessage(
            'Statistics retrieved',
            [
                'active_events' => $this->getActiveEventsCount(),
                'registered_users' => $this->getRegisteredUsersCount(),
                'teams' => $this->getTeamsCount(),
                'matches' => $this->getMatchesCount(),
            ]
        );
    }

    private function getActiveEventsCount(): int
    {
        return Event::where('event_state', 'ONGOING')->count();
    }

    private function getRegisteredUsersCount(): int
    {
        return User::count();
    }

    private function getTeamsCount(): int
    {
        return Team::count();
    }

    private function getMatchesCount(): int
    {
        return EventMatch::whereNotNull('winner')->count();
    }
}
