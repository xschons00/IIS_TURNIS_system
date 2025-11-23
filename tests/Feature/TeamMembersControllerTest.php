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
                     'message' => 'Team members retrieved',
                     'data' => [
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
                     'message' => 'Team member count retrieved',
                     'data' => [
                         'team_id' => $team->team_ID,
                         'members' => 2,
                     ],
                 ]);
    }

    public function test_returns_404_if_team_not_found(): void
    {
        $response = $this->getJson("/api/teams/9999/members/count");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Team not found']);
    }

    public function test_adds_team_member(): void
    {
        $team_leader = User::factory()->create(['role' => 'USER']);
        $this->actingAs($team_leader);
        $team = Team::factory()->create(['team_leader_id' => $team_leader->user_ID]);
        $new_member = User::factory()->create();
        $payload = ['user_ID' => $new_member->user_ID];
        $response = $this->postJson("/api/teams/{$team->team_ID}/members", $payload);
        $response->assertStatus(201)
                 ->assertJson(['message' => 'Member added successfully']);
        $this->assertDatabaseHas('team_members', [
            'team_ID' => $team->team_ID,
            'user_ID' => $new_member->user_ID,
        ]);

    }

    public function test_adds_team_member_fails_if_user_already_member(): void
    {
        $team_leader = User::factory()->create(['role' => 'USER']);
        $this->actingAs($team_leader);
        $team = Team::factory()->create(['team_leader_id' => $team_leader->user_ID]);
        $existing_member = User::factory()->create();
        $team->members()->attach($existing_member->user_ID);
        $payload = ['user_ID' => $existing_member->user_ID];
        $response = $this->postJson("/api/teams/{$team->team_ID}/members", $payload);
        $response->assertStatus(400)
                 ->assertJson(['message' => 'User is already a team member']);
    }

    public function test_adds_team_member_fails_if_team_not_found(): void
    {
        $team_leader = User::factory()->create(['role' => 'USER']);
        $this->actingAs($team_leader);
        $new_member = User::factory()->create();
        $payload = ['user_ID' => $new_member->user_ID];
        $response = $this->postJson("/api/teams/9999/members", $payload);
        $response->assertStatus(404); // Not Found
                
    }   

    public function test_removes_team_member(): void
    {
        $team_leader = User::factory()->create(['role' => 'USER']);
        $this->actingAs($team_leader);
        $team = Team::factory()->create(['team_leader_id' => $team_leader->user_ID]);
        $member = User::factory()->create();
        $team->members()->attach($member->user_ID);
        $payload = ['user_ID' => $member->user_ID];
        $response = $this->deleteJson("/api/teams/{$team->team_ID}/members", $payload);
        $response->assertStatus(200)
                 ->assertJson(['message' => 'Member removed successfully']);
        $this->assertDatabaseMissing('team_members', [
            'team_ID' => $team->team_ID,
            'user_ID' => $member->user_ID,
        ]);
    }

    public function test_removes_team_member_fails_if_user_not_member(): void
    {
        $team_leader = User::factory()->create(['role' => 'USER']);
        $this->actingAs($team_leader);
        $team = Team::factory()->create(['team_leader_id' => $team_leader->user_ID]);
        $non_member = User::factory()->create();
        $payload = ['user_ID' => $non_member->user_ID];
        $response = $this->deleteJson("/api/teams/{$team->team_ID}/members", $payload);
        $response->assertStatus(400)
                 ->assertJson(['message' => 'User is not a team member']);
    }

    public function test_removes_team_member_fails_if_team_not_found(): void
    {
        $team_leader = User::factory()->create(['role' => 'USER']);
        $this->actingAs($team_leader);
        $member = User::factory()->create();
        $payload = ['user_ID' => $member->user_ID];
        $response = $this->deleteJson("/api/teams/9999/members", $payload);
        $response->assertStatus(404);
    }

    public function test_member_can_leave_team(): void
    {
        $leader = User::factory()->create();
        $member = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $team->members()->attach([$leader->user_ID, $member->user_ID]);

        $this->actingAs($member);
        $response = $this->deleteJson("/api/teams/{$team->team_ID}/members/leave");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Left team successfully']);

        $this->assertDatabaseMissing('team_members', [
            'team_ID' => $team->team_ID,
            'user_ID' => $member->user_ID,
        ]);
        $this->assertDatabaseHas('team_members', [
            'team_ID' => $team->team_ID,
            'user_ID' => $leader->user_ID,
        ]);
    }

    public function test_leader_cannot_leave_team(): void
    {
        $leader = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $team->members()->attach($leader->user_ID);

        $this->actingAs($leader);
        $response = $this->deleteJson("/api/teams/{$team->team_ID}/members/leave");

        $response->assertStatus(403)
            ->assertJson(['message' => 'Team leader cannot leave the team']);

        $this->assertDatabaseHas('team_members', [
            'team_ID' => $team->team_ID,
            'user_ID' => $leader->user_ID,
        ]);
    }

    public function test_non_member_cannot_leave(): void
    {
        $leader = User::factory()->create();
        $nonMember = User::factory()->create();
        $team = Team::factory()->create(['team_leader_id' => $leader->user_ID]);
        $team->members()->attach($leader->user_ID);

        $this->actingAs($nonMember);
        $response = $this->deleteJson("/api/teams/{$team->team_ID}/members/leave");

        $response->assertStatus(400)
            ->assertJson(['message' => 'User is not a team member']);
    }

    public function test_unauthenticated_leave_without_user_id_is_unauthorized(): void
    {
        $team = Team::factory()->create();
        $response = $this->deleteJson("/api/teams/{$team->team_ID}/members/leave");

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthorized']);
    }
}
