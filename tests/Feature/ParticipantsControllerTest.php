<?php
namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParticipantsControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_participants_for_solo_event(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);

        $user1 = User::factory()->create([
            'user_name' => 'user1',
            'first_name' => 'First1',
            'last_name' => 'Last1',
            'faculty' => null,
            'ranking' => null,
        ]);
        $user2 = User::factory()->create([
            'user_name' => 'user2',
            'first_name' => 'First2',
            'last_name' => 'Last2',
            'faculty' => null,
            'ranking' => null,
        ]);

        $event->players()->attach([$user1->user_ID, $user2->user_ID]);

        $response = $this->getJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(200)
                 ->assertJson([
                     'event_id' => $event->event_ID,
                     'event_name' => $event->event_name,
                     'event_type' => 'SOLO',
                     'participants' => [
                         [
                             'user_ID' => $user1->user_ID,
                             'user_name' => 'user1',
                             'first_name' => 'First1',
                             'last_name' => 'Last1',
                             'faculty' => null,
                             'ranking' => null,
                         ],
                         [
                             'user_ID' => $user2->user_ID,
                             'user_name' => 'user2',
                             'first_name' => 'First2',
                             'last_name' => 'Last2',
                             'faculty' => null,
                             'ranking' => null,
                         ],
                     ],
                 ]);
    }

    public function test_returns_participants_for_team_event(): void
    {
        $event = Event::factory()->create(['event_type' => 'TEAM']);

        $team1 = Team::factory()->create(['team_name' => 'Team1', 'ranking' => null]);
        $team2 = Team::factory()->create(['team_name' => 'Team2', 'ranking' => null]);

        $event->teams()->attach([$team1->team_ID, $team2->team_ID]);

        $response = $this->getJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(200)
                 ->assertJson([
                     'event_id' => $event->event_ID,
                     'event_name' => $event->event_name,
                     'event_type' => 'TEAM',
                     'participants' => [
                         [
                             'team_ID' => $team1->team_ID,
                             'team_name' => 'Team1',
                             'ranking' => null,
                         ],
                         [
                             'team_ID' => $team2->team_ID,
                             'team_name' => 'Team2',
                             'ranking' => null,
                         ],
                     ],
                 ]);
    }

    public function test_returns_404_if_event_not_found(): void
    {
        $response = $this->getJson('/api/events/999999/participants/count');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }
}
