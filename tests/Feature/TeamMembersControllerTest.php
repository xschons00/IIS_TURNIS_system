<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamMembersControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_team_members(): void
    {
        $team = Team::factory()->create(['team_name' => 'Team1']);

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

        // attach users as team members
        $team->members()->attach([$user1->user_ID, $user2->user_ID]);

        $response = $this->getJson("/api/teams/{$team->team_ID}/members");

        $response->assertStatus(200)
                 ->assertJson([
                     'team_id' => $team->team_ID,
                     'team_name' => $team->team_name,
                     'members' => [
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

    public function test_returns_team_member_count(): void
    {
        $team = Team::factory()->create();

        $user1 = User::factory()->create(['faculty' => null, 'ranking' => null]);
        $user2 = User::factory()->create(['faculty' => null, 'ranking' => null]);

        $team->members()->attach([$user1->user_ID, $user2->user_ID]);

        $response = $this->getJson("/api/teams/{$team->team_ID}/members/count");

        $response->assertStatus(200)
                 ->assertJson([
                     'team_id' => $team->team_ID,
                     'members' => 2,
                 ]);
    }

    public function test_returns_404_if_team_not_found(): void
    {
        $response = $this->getJson("/api/teams/9999/members/count");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Team not found']);
    }
}
