<?php

namespace Tests\Unit\Filters;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Http\Controllers\Filters\PlayerFilter; // FIXED
use Illuminate\Http\Request;

class PlayerFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_players_filter_returns_all_when_no_filters(): void
    {
        User::factory()->count(3)->create();
        $filter = app(PlayerFilter::class);

        $request = Request::create('/filters/players', 'GET');

        $response = $filter->GetPlayersFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(3, $result);
        $this->assertArrayHasKey('user_ID', $result->first());
    }

    public function test_get_players_filter_applies_simple_filters(): void
    {
        User::factory()->create(['user_name' => 'alice', 'faculty' => 'CHEMISTRY']);
        User::factory()->create(['user_name' => 'bob', 'faculty' => 'PHYSICS']);

        $filter = app(PlayerFilter::class);

        $request = Request::create('/filters/players', 'GET', [
            'filters' => ['faculty' => 'CHEMISTRY'],
        ]);

        $response = $filter->GetPlayersFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(1, $result);
        $this->assertEquals('alice', $result->first()['user_name']);
    }

    public function test_get_players_filter_ignores_null_filters(): void
    {
        User::factory()->create(['user_name' => 'carol', 'faculty' => "MATHEMATICS"]);
        User::factory()->create(['user_name' => 'dave', 'faculty' => 'ENGINEERING']);

        $filter = app(PlayerFilter::class);

        $request = Request::create('/filters/players', 'GET', [
            'filters' => ['faculty' => null],
        ]);

        $response = $filter->GetPlayersFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(2, $result);
    }
}
