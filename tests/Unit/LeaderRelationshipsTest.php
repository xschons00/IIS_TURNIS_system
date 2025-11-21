<?php

namespace Tests\Unit;

use App\Models\Event;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaderRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_team_leader_relationship_returns_expected_user(): void
    {
        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);

        $this->assertTrue($team->leader->is($leader));
    }

    public function test_event_leader_relationship_returns_expected_user(): void
    {
        $leader = User::factory()->create();
        $event = Event::factory()->create(['event_leader_id' => $leader->user_ID]);

        $this->assertTrue($event->leader->is($leader));
    }
}
