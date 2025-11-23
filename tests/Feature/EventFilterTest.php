<?php

namespace Tests\Unit\Filters;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Event;
use App\Http\Controllers\Filters\EventFilter;
use Illuminate\Http\Request;

class EventFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_events_filter_returns_all_when_no_filters(): void
    {
        Event::factory()->count(3)->create();
        $filter = app(EventFilter::class);

        $request = Request::create('/filters/events', 'GET');

        $response = $filter->GetEventsFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(3, $result);
        $this->assertArrayHasKey('event_ID', $result->first());
    }

    public function test_get_events_filter_applies_simple_filters(): void
    {
        Event::factory()->create(['event_name' => 'Alpha', 'event_type' => 'SOLO']);
        Event::factory()->create(['event_name' => 'Beta', 'event_type' => 'TEAM']);
        $filter = app(EventFilter::class);

        $request = Request::create('/filters/events', 'GET', [
            'filters' => ['event_type' => 'SOLO']
        ]);

        $response = $filter->GetEventsFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(1, $result);
        $this->assertEquals('Alpha', $result->first()['event_name']);
    }

    public function test_get_events_filter_ignores_null_filters(): void
    {
        Event::factory()->create(['event_name' => 'E1', 'event_type' => 'TEAM']);
        Event::factory()->create(['event_name' => 'E2', 'event_type' => 'SOLO']);
        $filter = app(EventFilter::class);

        $request = Request::create('/filters/events', 'GET', [
            'filters' => ['event_type' => null],
        ]);

        $response = $filter->GetEventsFilter($request);
        $payload = $response->getData(true);
        $result = collect($payload['data']);

        $this->assertCount(2, $result);
    }
}
