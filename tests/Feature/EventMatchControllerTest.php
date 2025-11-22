<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventMatchControllerTest extends TestCase
{
    use RefreshDatabase;

    /* ------------------------------------------------------------
     * GenerateEventMatches
     * ------------------------------------------------------------ */

    public function test_generate_matches_returns_404_when_event_not_found(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $response = $this->putJson('/api/events/999999/matches/generate');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }

    public function test_generate_matches_fails_when_player_count_invalid(): void
    {
        $leader = User::factory()->create(['role' => 'USER']);
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_type' => 'SOLO',
            'max_participants' => 10,
        ]);

        $participants = User::factory()->count(3)->create();
        $event->players()->attach($participants->pluck('user_ID'));

        $this->actingAs($leader);

        $response = $this->putJson("/api/events/{$event->event_ID}/matches/generate");

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Failed to create matches. Check participant count.']);
    }

    public function test_generate_matches_creates_correct_number_of_matches(): void
    {
        $leader = User::factory()->create(['role' => 'USER']);
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_type' => 'SOLO',
            'max_participants' => 8,
        ]);

        $players = User::factory()->count(8)->create();
        $event->players()->attach($players->pluck('user_ID'));

        $this->actingAs($leader);

        $response = $this->putJson("/api/events/{$event->event_ID}/matches/generate");

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Matches initialized successfully']);

        $this->assertDatabaseCount('event_matches', 7);
        $this->assertDatabaseHas('event_matches', [
            'event_ID' => $event->event_ID,
            'round'    => 3,
        ]);
    }

    /* ------------------------------------------------------------
     * GetAllEventMatches
     * ------------------------------------------------------------ */

    public function test_get_all_event_matches_returns_404_if_event_not_found(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->getJson('/api/events/999999/matches');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }

    public function test_get_all_event_matches_returns_matches(): void
    {
        $leader = User::factory()->create(['role' => 'USER']);
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
        ]);

        EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'round' => 1,
        ]);
        EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'round' => 2,
        ]);

        $this->actingAs($leader);

        $response = $this->getJson("/api/events/{$event->event_ID}/matches");

        $response->assertStatus(200)
                 ->assertJson([
                     'event_id'   => $event->event_ID,
                     'event_name' => $event->event_name,
                 ])
                 ->assertJsonCount(2, 'matches');
    }

    /* ------------------------------------------------------------
     * GetEventMatch
     * ------------------------------------------------------------ */

    public function test_get_event_match_returns_404_when_not_found(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->getJson('/api/matches/999999');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Match not found']);
    }

    public function test_get_event_match_returns_match(): void
    {
        $leader = User::factory()->create(['role' => 'USER']);
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
        ]);
        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'round' => 1,
        ]);

        $this->actingAs($leader);

        $response = $this->getJson("/api/matches/{$match->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'event_ID' => $match->event_ID,
                     'round'    => $match->round,
                 ]);
    }

    /* ------------------------------------------------------------
     * UpdateEventMatch
     * ------------------------------------------------------------ */

    public function test_update_event_match_returns_404_when_not_found(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->putJson('/api/matches/999999', []);

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }

    public function test_update_event_match_updates_valid_fields(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
        ]);
        $participantA = User::factory()->create();
        $participantB = User::factory()->create();

        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'participant_A' => $participantA->user_ID,
            'participant_B' => $participantB->user_ID,
            'winner' => null,
            'round' => 1,
        ]);

        $this->actingAs($leader);

        $response = $this->putJson("/api/matches/{$match->id}", [
            'winner' => $participantA->user_ID,
            'round' => 3,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'winner' => $participantA->user_ID,
                     'round'  => 3,
                 ]);

        $this->assertDatabaseHas('event_matches', [
            'id' => $match->id,
            'winner' => $participantA->user_ID,
            'round'  => 3,
        ]);
    }

    public function test_update_event_match_rejects_invalid_winner(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
        ]);
        $participantA = User::factory()->create();
        $participantB = User::factory()->create();

        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'participant_A' => $participantA->user_ID,
            'participant_B' => $participantB->user_ID,
            'winner' => null,
        ]);

        $this->actingAs($leader);

        $response = $this->putJson("/api/matches/{$match->id}", [
            'winner' => 999,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['winner']);
    }

    /* ------------------------------------------------------------
     * DeleteEventMatch
     * ------------------------------------------------------------ */

    public function test_delete_event_match_returns_404_when_not_found(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $response = $this->deleteJson('/api/matches/999999');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }

    public function test_delete_event_match_deletes_match(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
        ]);
        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
        ]);

        $this->actingAs($leader);

        $response = $this->deleteJson("/api/matches/{$match->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Match deleted']);

        $this->assertDatabaseMissing('event_matches', [
            'id' => $match->id,
        ]);
    }
}
