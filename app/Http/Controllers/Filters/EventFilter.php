<?php

namespace App\Http\Controllers\Filters;


use Illuminate\Http\Request;
use App\Models\Event;

class EventFilter 
{
    /**
     * Get events based on provided filters.
     * @param request \Illuminate\Http\Request
     * @return \Illuminate\Database\Eloquent\Collection
     * 
     * route: GET /filters/events
     */
    public function GetEventsFilter(Request $request)
    {
        $filters = $request->input('filters', []);

        if (empty($filters)) {
            return Event::all();
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

        return Event::where($db_filters)->get();
    }



}
