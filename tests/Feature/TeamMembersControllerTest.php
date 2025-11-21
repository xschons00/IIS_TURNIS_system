<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TeamMembersControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_returns_team_member_count()
    {
        $team = Team::factory()->create();

        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // attach users as team members
        $team->members()->attach([$user1->user_ID, $user2->user_ID]);

        $response = $this->getJson("/api/teams/{$team->team_ID}/members/count");

        $response->assertStatus(200)
                 ->assertJson([
                     'team_id' => $team->team_ID,
                     'members' => 2,
                 ]);
    }

    #[Test]
    public function it_returns_404_if_team_not_found()
    {
        $response = $this->getJson("/api/teams/9999/members/count");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Team not found']);
    }
}
