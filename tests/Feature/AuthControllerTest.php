<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'top-secret',
            'role' => 'USER',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'user@example.com',
            'password' => 'top-secret',
        ]);

        $response
            ->assertStatus(200)
            ->assertJsonPath('user.email', 'user@example.com');

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'correct-password',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);

        $this->assertGuest();
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create([
            'email' => 'me@example.com',
        ]);

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response
            ->assertStatus(200)
            ->assertJsonPath('email', 'me@example.com');
    }

    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    public function test_logout_invalidates_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(200);

        $this->assertGuest();
    }
}
