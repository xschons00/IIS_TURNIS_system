<?php

namespace App\Http\Controllers\Filters;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\ApiResponse;

class PlayerFilter 
{
    use ApiResponse;

    /**
     * Get events based on provided filters.
     * @param request \Illuminate\Http\Request
     * @return \Illuminate\Database\Eloquent\Collection
     * 
     * route: /api/filter/events
     */
    public function GetPlayersFilter(Request $request): JsonResponse
    {
        $filters = $request->input('filters', []);

        if (empty($filters)) {
            return $this->respondWithMessage('Players retrieved', User::all());
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

        return $this->respondWithMessage('Players filtered', User::where($db_filters)->get());
    }



}
