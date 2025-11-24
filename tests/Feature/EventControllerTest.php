<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_events(): void
    {
        //create event leader
        $leader = User::factory()->create();
        
        Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_name' => 'Event One',
            'description' => 'First event',
            'event_date' => '2025-01-01',
            'location' => 'Location A',
            'event_type' => 'SOLO',
            'event_state' => 'NEW',
            'max_participants' => 16,
        ]);

        Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_name' => 'Event Two',
            'description' => 'Second event',
            'event_date' => '2025-01-02',
            'location' => 'Location B',
            'event_type' => 'TEAM',
            'event_state' => 'NEW',
            'max_participants' => 32,
        ]);

        $response = $this->getJson('/api/events');

        $response
            ->assertStatus(200)
            ->assertJson(['message' => 'Events retrieved'])
            ->assertJsonFragment(['event_name' => 'Event One'])
            ->assertJsonFragment(['event_name' => 'Event Two']);
    }

    public function test_store_creates_a_event(): void
    {
        $leader = User::factory()->create();

        $payload = [
            'event_name' => 'New Event',
            'description' => 'New event description',
            'event_date' => '2025-02-01',
            'location' => 'Main Hall',
            'event_type' => 'SOLO',
            'event_state' => 'NEW',
            'max_participants' => 8,
            'event_leader_id' => $leader->user_ID,
        ];

        $response = $this->postJson('/api/events/', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('events', [
            'event_name' => 'New Event',
            'location' => 'Main Hall',
            'event_leader_id' => $leader->user_ID,
        ]);
    }

    public function test_show_returns_single_event(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_name' => 'Shown Event',
            'description' => 'To be shown',
            'event_date' => '2025-03-01',
            'location' => 'Arena',
            'event_type' => 'TEAM',
            'event_state' => 'NEW',
            'max_participants' => 24,
        ]);

        $response = $this->getJson('/api/events/' . $event->event_ID);

        $response
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Event retrieved',
                'data' => [
                    'event_ID' => $event->event_ID,
                ],
            ]);
    }

    public function test_update_modifies_existing_event(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_name' => 'Old Name',
            'description' => 'Old description',
            'event_date' => '2025-04-01',
            'location' => 'Old Location',
            'event_type' => 'SOLO',
            'event_state' => 'NEW',
            'max_participants' => 12,
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $response = $this->putJson('/api/events/' . $event->event_ID, [
            'event_name' => 'Updated Name',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'event_ID' => $event->event_ID,
            'event_name' => 'Updated Name',
        ]);
    }

    public function test_destroy_deletes_event(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_name' => 'To Delete',
            'description' => 'To delete',
            'event_date' => '2025-05-01',
            'location' => 'Temp',
            'event_type' => 'TEAM',
            'event_state' => 'NEW',
            'max_participants' => 10,
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $response = $this->deleteJson('/api/events/' . $event->event_ID);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('events', [
            'event_ID' => $event->event_ID,
        ]);
    }

    public function test_event_leader_can_start_event_and_generate_matches(): void
    {
        $leader = User::factory()->create(['role' => 'USER']);
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_type' => 'SOLO',
            'event_state' => 'REGISTRATION',
            'max_participants' => 4,
        ]);

        $players = User::factory()->count(4)->create();
        $event->players()->attach(
            $players->pluck('user_ID')->mapWithKeys(fn ($id) => [$id => ['status' => 'ACCEPTED']])->toArray()
        );

        $this->actingAs($leader);

        $response = $this->putJson("/api/events/{$event->event_ID}/start");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Event started']);

        $this->assertDatabaseHas('events', [
            'event_ID' => $event->event_ID,
            'event_state' => 'ONGOING',
        ]);

        $this->assertDatabaseCount('event_matches', 3);
        $this->assertDatabaseHas('event_matches', [
            'event_ID' => $event->event_ID,
            'round' => 2,
        ]);
    }

    public function test_pending_participants_are_removed_on_start(): void
    {
        $leader = User::factory()->create(['role' => 'USER']);
        $event = Event::factory()->create([
            'event_leader_id' => $leader->user_ID,
            'event_type' => 'SOLO',
            'event_state' => 'REGISTRATION',
            'max_participants' => 4,
        ]);

        $accepted = User::factory()->count(2)->create();
        $pending = User::factory()->count(2)->create();

        $event->players()->attach(
            $accepted->pluck('user_ID')->mapWithKeys(fn ($id) => [$id => ['status' => 'ACCEPTED']])->toArray()
        );
        $event->players()->attach(
            $pending->pluck('user_ID')->mapWithKeys(fn ($id) => [$id => ['status' => 'REQUESTED']])->toArray()
        );

        $this->actingAs($leader);

        $response = $this->putJson("/api/events/{$event->event_ID}/start");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Event started']);

        foreach ($accepted as $user) {
            $this->assertDatabaseHas('player_participants', [
                'event_ID' => $event->event_ID,
                'user_ID' => $user->user_ID,
                'status' => 'ACCEPTED',
            ]);
        }

        foreach ($pending as $user) {
            $this->assertDatabaseMissing('player_participants', [
                'event_ID' => $event->event_ID,
                'user_ID' => $user->user_ID,
            ]);
        }
    }
}
