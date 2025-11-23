<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_teams(): void
    {
        Team::factory()->create([
            'team_name' => 'Alpha',
            'ranking' => 1,
        ]);

        Team::factory()->create([
            'team_name' => 'Beta',
            'ranking' => 2,
        ]);

        $response = $this->getJson('/api/teams');

        $response
            ->assertStatus(200)
            ->assertJson(['message' => 'Teams retrieved'])
            ->assertJsonFragment(['team_name' => 'Alpha'])
            ->assertJsonFragment(['team_name' => 'Beta']);
    }

    public function test_store_creates_a_team(): void
    {
        $leader = User::factory()->create();

        $payload = [
            'team_name' => 'Gamma',
            'ranking' => 3,
            'team_leader_id' => $leader->user_ID,
        ];

        $response = $this->postJson('/api/teams', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('teams', [
            'team_name' => 'Gamma',
            'team_leader_id' => $leader->user_ID,
        ]);
    }

    public function test_show_returns_single_team(): void
    {
        $team = Team::factory()->create([
            'team_name' => 'Delta',
            'ranking' => 4,
        ]);

        $response = $this->getJson('/api/teams/' . $team->team_ID);

        $response
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Team retrieved',
                'data' => [
                    'team_ID' => $team->team_ID,
                ],
            ]);
    }

    public function test_update_modifies_existing_team(): void
    {
        $team = Team::factory()->create([
            'team_name' => 'Old Team',
            'ranking' => 5,
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $response = $this->putJson('/api/teams/' . $team->team_ID, [
            'team_name' => 'Updated Team',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('teams', [
            'team_ID' => $team->team_ID,
            'team_name' => 'Updated Team',
        ]);
    }

    public function test_destroy_deletes_team(): void
    {
        $team = Team::factory()->create([
            'team_name' => 'To Remove',
            'ranking' => 6,
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $response = $this->deleteJson('/api/teams/' . $team->team_ID);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('teams', [
            'team_ID' => $team->team_ID,
        ]);
    }
}
