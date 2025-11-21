<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Event;

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

        $event = Event::findOrFail($request->route('id'));

        if ($user->role !== 'ADMIN' && $event->event_leader_id !== $user->user_ID) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
