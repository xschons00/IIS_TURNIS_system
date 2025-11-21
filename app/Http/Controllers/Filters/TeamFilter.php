<?php

namespace App\Http\Controllers\Filters;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Team;

class TeamFilter extends Controller
{
    /**
     * Get teams based on filters provided in the request.
     * @param Request $request
     * @return \Illuminate\Database\Eloquent\Collection
     * 
     * route: POST /api/teams/filter
     */
    public function GetTeamsFilter(Request $request)
    {

        $filters = $request->input('filters', []);
        if (empty($filters)) {
            return Team::all();
        }
        // remove null filters
        foreach ($filters as $field => $value) {
            if (is_null($value)) {
                unset($filters[$field]);
            }
        }
        // build db filters
        $db_filters = [];
        foreach ($filters as $field => $value) {
            $db_filters[] = [$field, '=', $value];
        }

        return Team::where($db_filters)->get();
    }



}
