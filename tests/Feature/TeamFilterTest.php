<?php

namespace Tests\Unit\Filters;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Team;
use App\Http\Controllers\Filters\TeamFilter;
use Illuminate\Http\Request;

class TeamFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_teams_filter_returns_all_when_no_filters(): void
    {
        Team::factory()->count(3)->create();
        $filter = app(TeamFilter::class);

        $request = Request::create('/filters/teams', 'GET');

        $response = $filter->GetTeamsFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(3, $result);
        $this->assertArrayHasKey('team_ID', $result->first());
    }

    public function test_get_teams_filter_applies_simple_filters(): void
    {
        Team::factory()->create(['team_name' => 'Red', 'ranking' => 100]);
        Team::factory()->create(['team_name' => 'Blue', 'ranking' => 200]);
        $filter = app(TeamFilter::class);

        $request = Request::create('/filters/teams', 'GET', [
            'filters' => ['ranking' => 100]
        ]);

        $response = $filter->GetTeamsFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(1, $result);
        $this->assertEquals('Red', $result->first()['team_name']);
    }

    public function test_get_teams_filter_ignores_null_filters(): void
    {
        Team::factory()->create(['team_name' => 'T1', 'ranking' => null]);
        Team::factory()->create(['team_name' => 'T2', 'ranking' => 50]);
        $filter = app(TeamFilter::class);

        $request = Request::create('/filters/teams', 'GET', [
            'filters' => ['ranking' => null],
        ]);

        $response = $filter->GetTeamsFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(2, $result);
    }
}
