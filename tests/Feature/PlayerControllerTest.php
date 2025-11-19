<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_players(): void
    {
        User::create([
            'user_name' => 'player1',
            'first_name' => 'Player',
            'last_name' => 'One',
            'email' => 'player1@example.com',
            'password' => 'password',
            'faculty' => 'ENGINEERING',
            'role' => 'USER',
        ]);

        User::create([
            'user_name' => 'player2',
            'first_name' => 'Player',
            'last_name' => 'Two',
            'email' => 'player2@example.com',
            'password' => 'password',
            'faculty' => 'BUSINESS',
            'role' => 'USER',
        ]);

        $response = $this->getJson('/api/players');

        $response
            ->assertStatus(200)
            ->assertJsonFragment(['user_name' => 'player1'])
            ->assertJsonFragment(['user_name' => 'player2']);
    }

    public function test_store_creates_a_player(): void
    {
        $payload = [
            'user_name' => 'newplayer',
            'first_name' => 'New',
            'last_name' => 'Player',
            'email' => 'newplayer@example.com',
            'password' => 'password',
            'faculty' => 'COMPUTER_SCIENCE',
            'role' => 'USER',
        ];

        $response = $this->postJson('/api/players', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'user_name' => 'newplayer',
            'email' => 'newplayer@example.com',
        ]);
    }

    public function test_show_returns_single_player(): void
    {
        $player = User::create([
            'user_name' => 'singleplayer',
            'first_name' => 'Single',
            'last_name' => 'Player',
            'email' => 'single@example.com',
            'password' => 'password',
            'faculty' => 'CHEMISTRY',
            'role' => 'USER',
        ]);

        $response = $this->getJson('/api/players/' . $player->user_ID);

        $response
            ->assertStatus(200)
            ->assertJsonFragment(['user_ID' => $player->user_ID]);
    }

    public function test_update_modifies_existing_player(): void
    {
        $player = User::create([
            'user_name' => 'oldname',
            'first_name' => 'Old',
            'last_name' => 'Name',
            'email' => 'old@example.com',
            'password' => 'password',
            'faculty' => 'ARTS',
            'role' => 'USER',
        ]);

        $response = $this->putJson('/api/players/' . $player->user_ID, [
            'user_name' => 'newname',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'user_ID' => $player->user_ID,
            'user_name' => 'newname',
        ]);
    }

    public function test_destroy_deletes_player(): void
    {
        $player = User::create([
            'user_name' => 'todelete',
            'first_name' => 'To',
            'last_name' => 'Delete',
            'email' => 'todelete@example.com',
            'password' => 'password',
            'faculty' => 'ENGINEERING',
            'role' => 'USER',
        ]);

        $response = $this->deleteJson('/api/players/' . $player->user_ID);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', [
            'user_ID' => $player->user_ID,
        ]);
    }
}
