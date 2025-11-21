<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;

class ParticipantCount extends Controller
{
    /**
     * Return number of participants for an event.
     *
     * Uses event_type: 'SOLO' -> counts player relations, 'TEAM' -> counts team relations.
     *
    * @return JsonResponse data with participant count
     */
    public function GetParticipantCount(Request $request, int $id): JsonResponse
    {
        $event = Event::find($id);

        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $count = $event->players()->count();
        } elseif ($type === 'TEAM') {
            $count = $event->teams()->count();
        } else {
            return response()->json([
                'message' => 'Unknown event type',
                'event_type' => $event->event_type,
            ], 400);
        }

        return response()->json([
            'event_id' => $event->event_ID,
            'event_type' => $type,
            'participants' => $count,
        ]);
    }
}