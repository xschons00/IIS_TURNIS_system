<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventMatch;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatisticsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_statistics_endpoint_returns_expected_counts(): void
    {
        $users = User::factory()->count(3)->create();

        $activeEventOne = Event::create([
            'event_name' => 'Active Event 1',
            'description' => 'Event in progress',
            'event_date' => '2025-01-01',
            'location' => 'Arena',
            'event_type' => 'SOLO',
            'event_state' => 'ONGOING',
            'max_participants' => 16,
        ]);

        Event::create([
            'event_name' => 'Active Event 2',
            'description' => 'Another active event',
            'event_date' => '2025-02-01',
            'location' => 'Hall',
            'event_type' => 'TEAM',
            'event_state' => 'ONGOING',
            'max_participants' => 8,
        ]);

        Event::create([
            'event_name' => 'Finished Event',
            'description' => 'Already done',
            'event_date' => '2024-12-01',
            'location' => 'Offsite',
            'event_type' => 'SOLO',
            'event_state' => 'FINISHED',
            'max_participants' => 4,
        ]);

        Team::factory()->count(2)->create();

        EventMatch::create([
            'event_ID' => $activeEventOne->event_ID,
            'participant_A' => $users[0]->user_ID,
            'participant_B' => $users[1]->user_ID,
            'round' => 1,
            'time' => now(),
            'winner' => $users[0]->user_ID,
        ]);

        EventMatch::create([
            'event_ID' => $activeEventOne->event_ID,
            'participant_A' => $users[1]->user_ID,
            'participant_B' => $users[2]->user_ID,
            'round' => 2,
            'time' => now(),
            'winner' => null,
        ]);

        $response = $this->getJson('/api/statistics');

        $response
            ->assertStatus(200)
            ->assertJson([
                'active_events' => 2,
                'registered_users' => 3,
                'teams' => 2,
                'matches' => 1,
            ]);
    }
}
