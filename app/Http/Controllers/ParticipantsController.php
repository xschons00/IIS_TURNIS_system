<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;

class ParticipantsController extends Controller
{

    /**
     * GET /api/tournaments/{id}/participants
     * Returns list of team members.
     * @return JsonResponse data with team members
     * route::get('/api/teams/{id}/members', [TeamMembersController::class, 'GetTeamMembers']);
     */

    public function GetParticipants(Request $request, int $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $participants = $event->players()->get(['users.user_ID', 'users.user_name', 'users.first_name', 'users.last_name',
                                                  'users.faculty', 'users.ranking']);
        } elseif ($type === 'TEAM') {
            $participants = $event->teams()->get(['teams.team_ID', 'teams.team_name', 'teams.ranking']);
        } else {
            return response()->json([
                'message' => 'Unknown event type',
                'event_type' => $event->event_type,
            ], 400);
        }

        return response()->json([
            'event_id' => $event->event_ID,
            'event_name' => $event->event_name,
            'event_type' => $type,
            'participants' => $participants,
        ]);
    }


    /**
     * Return number of participants for an event.
     * @return JsonResponse data with participant count
     * Uses event_type: 'SOLO' -> counts player relations, 'TEAM' -> counts team relations.
     * get /api/tournaments/{id}/participants/count
     *
    * @return JsonResponse data with participant count
     */
    public function GetParticipantCount(Request $request, int $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
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