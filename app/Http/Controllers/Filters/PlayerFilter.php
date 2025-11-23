<?php

namespace App\Http\Controllers\Filters;

use Illuminate\Http\Request;
use App\Models\User;

class PlayerFilter 
{
    /**
     * Get events based on provided filters.
     * @param request \Illuminate\Http\Request
     * @return \Illuminate\Database\Eloquent\Collection
     * 
     * route: /api/filter/events
     */
    public function GetPlayersFilter(Request $request)
    {
        $filters = $request->input('filters', []);

        if (empty($filters)) {
            return User::all();
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

        return User::where($db_filters)->get();
    }



}
