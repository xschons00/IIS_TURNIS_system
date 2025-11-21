<?php

namespace App\Http\Controllers;

use app\Models\Event;
use app\Models\User;
use app\Models\Team;
use app\Models\EventMatch;


class StatisticsController extends Controller
{
    public function index()
    {

        return [
            "active_events"=>$this->getActiveEventsCount(),
            "registered_users"=>$this->getRegisteredUsersCount(),
            "teams"=>$this->getTeamsCount(),
            "matches"=>$this->getMatchesCount(),
    ];
    }

    private function getActiveEventsCount()
    {
        return Event::where('status', 'active')->count();
    }

    private function getRegisteredUsersCount()
    {
        // Logic to retrieve the count of registered users
        return User::all()->count();
    }
    private function getTeamsCount()
    {
        // Logic to retrieve the count of teams
        return Team::all()->count();
    }
    private function getMatchesCount()
    {
        // Logic to retrieve the count of matches
        return EventMatch::where("winner","!=",null)->count();
    }

}

