<?php
namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ParticipantsControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_returns_participant_count_for_solo_event()
    {
        $event = Event::factory()->create(['event_type' => 'SOLO']);
        
        // Create users and associate them with the event
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $event->players()->attach([$user1->user_ID, $user2->user_ID]);

        $response = $this->getJson("/api/tournaments/{$event->event_ID}/participants/count");

        $response->assertStatus(200)
                 ->assertJson([
                     'event_id' => $event->event_ID,
                     'event_type' => 'SOLO',
                     'participants' => 2,
                 ]);
    }

    #[Test]
    public function it_returns_participant_count_for_team_event()
    {
        $event = Event::factory()->create(['event_type' => 'TEAM']);
        
        // Create teams and associate them with the event
        $team1 = Team::factory()->create();
        $team2 = Team::factory()->create();

        $event->teams()->attach([$team1->team_ID, $team2->team_ID]);

        $response = $this->getJson("/api/tournaments/{$event->event_ID}/participants/count");

        $response->assertStatus(200)
                 ->assertJson([
                     'event_id' => $event->event_ID,
                     'event_type' => 'TEAM',
                     'participants' => 2,
                 ]);
    }

    #[Test]
    public function it_returns_404_if_event_not_found()
    {
        $response = $this->getJson("/api/tournaments/999/participants/count");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Event not found']);
    }

}
