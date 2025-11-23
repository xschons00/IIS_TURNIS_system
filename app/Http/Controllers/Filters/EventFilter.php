<?php

namespace App\Http\Controllers\Filters;


use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\ApiResponse;

class EventFilter 
{
    use ApiResponse;

    /**
     * Get events based on provided filters.
     * @param request \Illuminate\Http\Request
     * @return \Illuminate\Database\Eloquent\Collection
     * 
     * route: GET /filters/events
     */
    public function GetEventsFilter(Request $request): JsonResponse
    {
        $filters = $request->input('filters', []);

        if (empty($filters)) {
            return $this->respondWithMessage('Events retrieved', Event::all());
        }

        foreach ($filters as $field => $value) {
            if (is_null($value)) {
                unset($filters[$field]);
            }
        }

        $db_filters = [];
        foreach ($filters as $field => $value) {
            $db_filters[] = [$field, '=', $value];
        }

        return $this->respondWithMessage('Events filtered', Event::where($db_filters)->get());
    }



}
