<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TournamentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_tournaments(): void
    {
        Event::create([
            'event_name' => 'Event One',
            'description' => 'First event',
            'event_date' => '2025-01-01',
            'location' => 'Location A',
            'event_type' => 'SOLO',
            'max_participants' => 16,
        ]);

        Event::create([
            'event_name' => 'Event Two',
            'description' => 'Second event',
            'event_date' => '2025-01-02',
            'location' => 'Location B',
            'event_type' => 'TEAM',
            'max_participants' => 32,
        ]);

        $response = $this->getJson('/api/tournaments');

        $response
            ->assertStatus(200)
            ->assertJsonFragment(['event_name' => 'Event One'])
            ->assertJsonFragment(['event_name' => 'Event Two']);
    }

    public function test_store_creates_a_tournament(): void
    {
        $payload = [
            'event_name' => 'New Event',
            'description' => 'New event description',
            'event_date' => '2025-02-01',
            'location' => 'Main Hall',
            'event_type' => 'SOLO',
            'max_participants' => 8,
        ];

        $response = $this->postJson('/api/tournaments', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('events', [
            'event_name' => 'New Event',
            'location' => 'Main Hall',
        ]);
    }

    public function test_show_returns_single_tournament(): void
    {
        $event = Event::create([
            'event_name' => 'Shown Event',
            'description' => 'To be shown',
            'event_date' => '2025-03-01',
            'location' => 'Arena',
            'event_type' => 'TEAM',
            'max_participants' => 24,
        ]);

        $response = $this->getJson('/api/tournaments/' . $event->event_ID);

        $response
            ->assertStatus(200)
            ->assertJsonFragment(['event_ID' => $event->event_ID]);
    }

    public function test_update_modifies_existing_tournament(): void
    {
        $event = Event::create([
            'event_name' => 'Old Name',
            'description' => 'Old description',
            'event_date' => '2025-04-01',
            'location' => 'Old Location',
            'event_type' => 'SOLO',
            'max_participants' => 12,
        ]);

        $response = $this->putJson('/api/tournaments/' . $event->event_ID, [
            'event_name' => 'Updated Name',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'event_ID' => $event->event_ID,
            'event_name' => 'Updated Name',
        ]);
    }

    public function test_destroy_deletes_tournament(): void
    {
        $event = Event::create([
            'event_name' => 'To Delete',
            'description' => 'To delete',
            'event_date' => '2025-05-01',
            'location' => 'Temp',
            'event_type' => 'TEAM',
            'max_participants' => 10,
        ]);

        $response = $this->deleteJson('/api/tournaments/' . $event->event_ID);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('events', [
            'event_ID' => $event->event_ID,
        ]);
    }
}
