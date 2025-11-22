<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PlayerParticipant;
use App\Models\TeamParticipant;
use App\Models\Team;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;

class ParticipantsController extends Controller
{

    /**
     * GET /api/events/{id}/participants
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
            $participants = $event->players()->get([
                'users.user_ID',
                'users.user_name',
                'users.first_name',
                'users.last_name',
                'users.faculty',
                'users.ranking'
            ]);
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
     * get /api/events/{id}/participants/count
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

    public function AddParticipant(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $alreadyRegistered = $event->players()
                ->where('users.user_ID', $user->user_ID)
                ->exists();

            if ($alreadyRegistered) {
                return response()->json(['message' => 'Player already registered'], 409);
            }

            if ($event->players()->count() >= $event->max_participants) {
                return response()->json(['message' => 'Event is full'], 409);
            }

            PlayerParticipant::create([
                'event_ID' => $event->event_ID,
                'user_ID' => $user->user_ID,
            ]);
        } elseif ($type === 'TEAM') {
            $team = Team::where('team_leader_id', $user->user_ID)->first();

            if (!$team) {
                return response()->json(['message' => 'Team not found'], 404);
            }

            $alreadyRegistered = $event->teams()
                ->where('teams.team_ID', $team->team_ID)
                ->exists();

            if ($alreadyRegistered) {
                return response()->json(['message' => 'Team already registered'], 409);
            }

            if ($event->teams()->count() >= $event->max_participants) {
                return response()->json(['message' => 'Event is full'], 409);
            }

            TeamParticipant::create([
                'event_ID' => $event->event_ID,
                'team_ID' => $team->team_ID,
            ]);
        } else {
            return response()->json([
                'message' => 'Unknown event type',
                'event_type' => $event->event_type,
            ], 400);
        }

        return response()->json(['message' => 'ok'], 200);
    }

    public function RemoveParticipant(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $registered = PlayerParticipant::where('event_ID', $event->event_ID)
                ->where('user_ID', $user->user_ID)
                ->exists();

            if (!$registered) {
                return response()->json(['message' => 'Player not registered'], 409);
            }

            PlayerParticipant::where('event_ID', $event->event_ID)
                ->where('user_ID', $user->user_ID)
                ->delete();
        } elseif ($type === 'TEAM') {
            $team = Team::where('team_leader_id', $user->user_ID)->first();

            if (!$team) {
                return response()->json(['message' => 'Team not found'], 404);
            }

            $registered = TeamParticipant::where('event_ID', $event->event_ID)
                ->where('team_ID', $team->team_ID)
                ->exists();

            if (!$registered) {
                return response()->json(['message' => 'Team not registered'], 409);
            }

            TeamParticipant::where('event_ID', $event->event_ID)
                ->where('team_ID', $team->team_ID)
                ->delete();

        } else {
            return response()->json([
                'message' => 'Unknown event type',
                'event_type' => $event->event_type,
            ], 400);
        }

        return response()->json(['message' => 'ok'], 200);
    }


}
