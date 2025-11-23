<?php
namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventMatch;
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

    public function test_requires_authentication_to_add_participant(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Unauthenticated']);
    }

    public function test_authenticated_user_can_join_solo_event(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'ok']);

        $this->assertDatabaseHas('player_participants', [
            'event_ID' => $event->event_ID,
            'user_ID' => $user->user_ID,
        ]);
    }

    public function test_team_leader_can_register_team_for_team_event(): void
    {
        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $event = Event::factory()->create(['event_type' => 'TEAM']);

        $this->actingAs($leader);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'ok']);

        $this->assertDatabaseHas('team_participants', [
            'event_ID' => $event->event_ID,
            'team_ID' => $team->team_ID,
        ]);
    }

    public function test_returns_404_when_leader_has_no_team_for_team_event(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create(['event_type' => 'TEAM']);

        $this->actingAs($leader);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Team not found']);

        $this->assertDatabaseMissing('team_participants', [
            'event_ID' => $event->event_ID,
        ]);
    }

    public function test_player_cannot_join_solo_event_twice(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);
        $user = User::factory()->create();

        $event->players()->attach($user->user_ID);

        $this->actingAs($user);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Player already registered']);
    }

    public function test_player_cannot_join_full_solo_event(): void
    {
        $event = Event::factory()->create([
            'event_type' => 'SOLO',
            'max_participants' => 1,
        ]);

        $existingParticipant = User::factory()->create();
        $event->players()->attach($existingParticipant->user_ID);

        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Event is full']);
    }

    public function test_team_cannot_join_twice(): void
    {
        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $event = Event::factory()->create(['event_type' => 'TEAM']);

        $event->teams()->attach($team->team_ID);

        $this->actingAs($leader);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Team already registered']);
    }

    public function test_team_cannot_join_full_event(): void
    {
        $event = Event::factory()->create([
            'event_type' => 'TEAM',
            'max_participants' => 1,
        ]);

        $existingTeam = Team::factory()->create();
        $event->teams()->attach($existingTeam->team_ID);

        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $this->actingAs($leader);

        $response = $this->postJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Event is full']);
    }

    public function test_requires_authentication_to_remove_participant(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);

        $response = $this->deleteJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Unauthenticated']);
    }

    public function test_player_can_leave_solo_event(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);
        $user = User::factory()->create();
        $event->players()->attach($user->user_ID);

        $this->actingAs($user);

        $response = $this->deleteJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'ok']);

        $this->assertDatabaseMissing('player_participants', [
            'event_ID' => $event->event_ID,
            'user_ID' => $user->user_ID,
        ]);
    }

    public function test_player_cannot_leave_if_not_registered(): void
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->deleteJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Player not registered']);
    }

    public function test_team_leader_can_remove_team_from_event(): void
    {
        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $event = Event::factory()->create(['event_type' => 'TEAM']);

        $event->teams()->attach($team->team_ID);

        $this->actingAs($leader);

        $response = $this->deleteJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'ok']);

        $this->assertDatabaseMissing('team_participants', [
            'event_ID' => $event->event_ID,
            'team_ID' => $team->team_ID,
        ]);
    }

    public function test_team_cannot_leave_if_not_registered(): void
    {
        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $event = Event::factory()->create(['event_type' => 'TEAM']);

        $this->actingAs($leader);

        $response = $this->deleteJson("/api/events/{$event->event_ID}/participants");

        $response->assertStatus(409)
                 ->assertJson(['message' => 'Team not registered']);
    }

    public function test_returns_score_for_valid_player_and_event()
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);

        $playerA = User::factory()->create();
        $playerB = User::factory()->create();

        $event->players()->attach([$playerA->user_ID, $playerB->user_ID]);

        EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'participant_A' => $playerA->user_ID,
            'participant_B' => $playerB->user_ID,
            'participant_A_points' => 10,
            'participant_B_points' => 2,
            'winner' => $playerA->user_ID,
        ]);

        $response = $this->getJson("/api/events/{$event->event_ID}/participants/{$playerA->user_ID}/points");

        $response->assertStatus(200)
                ->assertJson([
                    'event_id' => $event->event_ID,
                    'participant_id' => $playerA->user_ID,
                    'total_points' => 10,
                ]);
    }



    public function test_returns_404_if_points_event_not_found()
    {
        $response = $this->getJson("/api/events/999/participants/1/points");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }
}
