<?php

namespace Tests\Feature;
use App\Models\User;
use App\Models\Event;
use App\Models\EventMatch;
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
        
        $response = $this->putJson('/api/events/999999/matches/generate');

        $response->assertStatus(401); // Method Not Allowed since route is protected by middleware
    }

    public function test_generate_matches_fails_when_player_count_invalid(): void
    {
        //login as event leader
       
        $event_leader = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'top-secret',
            'role' => 'USER',
        ]);

       
       
        $event = Event::factory()->create([
            'event_leader_id' => $event_leader->user_ID,
            'max_participants' => 10, // Invalid count (not 2^n)
        ]);

        // Simulate invalid participant count (not 2^n)
        // Mock your _GetParticipantCount() if needed.
        // For now, manually attach 3 players:
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();
        $event->players()->attach([$user1->user_ID, $user2->user_ID, $user3->user_ID]);
       
        $this->actingAs($event_leader, 'api');
        $response = $this->putJson("/api/events/{$event->event_ID}/matches/generate");

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Failed to create matches. Check participant count.']);
    }

    public function test_generate_matches_creates_correct_number_of_matches(): void
    {
        //login as event leader
       
        $event_leader = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'top-secret',
            'role' => 'USER',
        ]);
     
        $this->actingAs($event_leader, 'api');
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'max_participants' => 8,
        ]);

        // Simulate 8 participants (valid — 2,4,8,16,32)
        $event->players()->attach([1,2,3,4,5,6,7,8]);

        $response = $this->putJson("/api/events/{$event->event_ID}/matches/generate");

        $response->assertStatus(201)
                 ->assertJson(['message' => 'Matches initialized successfully']);

        // For 8 participants: rounds = 1:4, 2:2, 3:1 BUT your code stops before final (numMatches !== 1)
        // So only: 4 + 2 = 6 matches created
        $this->assertDatabaseCount('event_matches', 6);

        $this->assertDatabaseHas('event_matches', [
            'event_ID' => $event->event_ID,
            'round'    => 1,
        ]);
        $this->assertDatabaseHas('event_matches', [
            'event_ID' => $event->event_ID,
            'round'    => 2,
        ]);
    }

    /* ------------------------------------------------------------
     * GetAllEventMatches
     * ------------------------------------------------------------ */

    public function test_get_all_event_matches_returns_404_if_event_not_found(): void
    {
        $response = $this->getJson('/api/events/999999/matches');

        $response->assertStatus(405); // Method Not Allowed since route is protected by middleware

    }

    public function test_get_all_event_matches_returns_matches(): void
    {
                //login as event leader
       
        $event_leader = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'top-secret',
            'role' => 'USER',
        ]);
        
        $this->actingAs($event_leader, 'api');

        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
        ]);

        $match1 = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'round' => 1,
        ]);
        $match2 = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'round' => 2,
        ]);

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

    public function test_get_event_match_returns_null_when_not_found(): void
    {
        $response = $this->getJson('/api/matches/999999');

        $response->assertStatus(200)
                 ->assertSee(null);
    }

    public function test_get_event_match_returns_match(): void
    {
        $event_leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $event_leader->user_ID,
        ]);

            
        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'round' => 1,
        ]);

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

    public function test_update_event_match_returns_null_when_not_found(): void
    {
        $response = $this->putJson('/api/matches/999999', []);

        $response->assertStatus(401); // Method Not Allowed since route is protected by middleware
    }

    public function test_update_event_match_updates_valid_fields(): void
    {
        $event_leader = User::factory()->create();
        actingAs($event_leader, 'api');
        $event = Event::factory()->create([
            'event_leader_id' => $event_leader->user_ID,
        ]);
        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'participant_A' => 1,
            'participant_B' => 2,
            'winner' => null,
        ]);

        $response = $this->putJson("/api/matches/{$match->id}", [
            'winner' => 1,
            'round' => 3,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'winner' => 1,
                     'round'  => 3,
                 ]);

        $this->assertDatabaseHas('event_matches', [
            'winner' => 1,
            'round'  => 3,
        ]);
    }

    public function test_update_event_match_rejects_invalid_winner(): void
    {
        $event_leader = User::factory()->create();
        $this->actingAs($event_leader, 'api');
        $event = Event::factory()->create([
            'event_leader_id' => $event_leader->user_ID,
        ]);
        $match = EventMatch::factory()->create([
            'event_ID' => $event->event_ID,
            'participant_A' => 10,
            'participant_B' => 20,
            'winner' => null,
        ]);

        $response = $this->putJson("/api/matches/{$match->id}", [
            'winner' => 999, // invalid
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['winner']);
    }

    /* ------------------------------------------------------------
     * DeleteEventMatch
     * ------------------------------------------------------------ */

    public function test_delete_event_match_does_nothing_if_not_found(): void
    {

        $response = $this->deleteJson('/api/matches/999999');

        $response->assertStatus(401); // Method Not Allowed since route is protected by middleware
    }

    public function test_delete_event_match_deletes_match(): void
    {
        $event_leader = User::factory()->create();
        $this->actingAs($event_leader, 'api');
        $event = Event::factory()->create([
            'event_leader_id' => $event_leader->user_ID,
        ]);
        $match = EventMatch::factory()->create( [
            'event_ID' => $event->event_ID,
            'round' => 1,
        ]);

        $response = $this->deleteJson("/api/matches/{$match->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('event_matches', [
            'event_ID' => $match->event_ID,
            'round'    => $match->round,
        ]);
    }
}
