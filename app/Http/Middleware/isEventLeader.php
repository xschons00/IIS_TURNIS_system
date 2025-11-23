<?php

namespace App\Http\Middleware;

use Closure;

use App\Models\Event;
use App\Models\EventMatch;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class isEventLeader
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $resourceId = $request->route('id');

        if ($this->isMatchRoute($request)) {
            $match = EventMatch::find($resourceId);

            if (! $match) {
                return response()->json(['message' => 'Match not found'], 404);
            }

            $event = Event::find($match->event_ID);
        } else {
            $event = Event::find($resourceId);
        }

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        if ($user->role !== 'ADMIN' && $event->event_leader_id !== $user->user_ID) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }

    private function isMatchRoute(Request $request): bool
    {
        $route = $request->route();

        if (! $route) {
            return false;
        }

        return strpos($route->uri(), 'matches/') === 0;
    }
}
