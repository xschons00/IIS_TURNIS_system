<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventMatch;
use App\Models\Team;
use App\Models\User;

class StatisticsController extends Controller
{
    public function index(): array
    {
        return [
            'active_events' => $this->getActiveEventsCount(),
            'registered_users' => $this->getRegisteredUsersCount(),
            'teams' => $this->getTeamsCount(),
            'matches' => $this->getMatchesCount(),
        ];
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
