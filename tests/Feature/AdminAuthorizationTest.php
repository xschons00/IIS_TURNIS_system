<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_user_is_blocked_from_admin_routes(): void
    {
        $user = User::factory()->create(['role' => 'USER']);
        $team = Team::factory()->create(['team_name' => 'Alpha', 'ranking' => 1]);

        $response = $this->actingAs($user)->putJson('/api/teams/' . $team->team_ID, [
            'team_name' => 'Blocked Update',
        ]);

        $response
            ->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);

        $this->assertDatabaseHas('teams', [
            'team_ID' => $team->team_ID,
            'team_name' => 'Alpha',
        ]);
    }

    public function test_admin_user_can_access_admin_routes(): void
    {
        $admin = User::factory()->admin()->create();
        $team = Team::factory()->create(['team_name' => 'Original', 'ranking' => 3]);

        $response = $this->actingAs($admin)->putJson('/api/teams/' . $team->team_ID, [
            'team_name' => 'Updated Team',
        ]);

        $response
            ->assertStatus(200)
            ->assertJsonPath('team_name', 'Updated Team');

        $this->assertDatabaseHas('teams', [
            'team_ID' => $team->team_ID,
            'team_name' => 'Updated Team',
        ]);
    }
}
