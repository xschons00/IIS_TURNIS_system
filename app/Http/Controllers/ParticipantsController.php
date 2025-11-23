<?php


namespace App\Http\Controllers;

use App\Models\PlayerParticipant;
use App\Models\TeamParticipant;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;

class ParticipantsController 
{

    /**
     * GET /api/events/{id}/participants
     * Returns list of team members.
     * @return JsonResponse data with team members
     * route::get('/api/teams/{id}/members', [TeamMembersController::class, 'GetTeamMembers']);
     */

    public function GetParticipants(int $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Match not found'], 404);
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
    public function GetParticipantCount(int $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $type = strtoupper($event->event_type ?? '');

        $count = self::_GetParticipantCount($event);

        return response()->json([
            'event_id' => $event->event_ID,
            'event_type' => $type,
            'participants' => $count,
        ]);
    }

    //helper functions to get participant count
    public static function _GetParticipantCount(Event $event): int
    {
        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            return $event->players()->get()->count();
        } elseif ($type === 'TEAM') {
            return $event->teams()->get()->count();
        } else {
            return  0;
        }
    }

    public function AddParticipant(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Match not found'], 404);
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
            return response()->json(['message' => 'Match not found'], 404);
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



     // helper to calculate final score
    public static function _CalculateTotalScore(Event $event, int $participant_ID): int
    {
        // get participant if exists
        $type = strtoupper($event->event_type ?? '');
        if ($type === 'SOLO') {
            $participant = $event->players()->where('user_ID', $participant_ID)->first();
        } elseif ($type === 'TEAM') {
            $participant = $event->teams()->where('team_ID', $participant_ID)->first();
        } else {
            return 0;
        }

        if (! $participant) {
            return 0;
        }

        $matches = $event->matches();
        $totalPoints = 0;
        foreach ($matches->get() as $match) {
            if ($match->participant_A === $participant_ID) {
                $totalPoints += $match->participant_A_points;
            } elseif ($match->participant_B === $participant_ID) {
                $totalPoints += $match->participant_B_points;
            }
        }
        return $totalPoints;
    }

    // returns calculated score for player from his matchces
    public function GetTotalScoreForPlayer(int $event_id, int $participant_id): JsonResponse
    {
        $event = Event::find($event_id);
        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $totalPoints = self::_CalculateTotalScore($event, $participant_id);

        return response()->json([
            'event_id' => $event->event_ID,
            'participant_id' => $participant_ID,
            'total_points' => $totalPoints,
        ]);
    }
    
    // Calculate final placement for participants of event
    public function GetFinalPlacements(int $id): JsonResponse
    {
        $event = Event::find($id);
        if (! $event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $participants = $event->players()->get();
        } elseif ($type === 'TEAM') {
            $participants = $event->teams()->get();
        } else {
            return response()->json(['message' => 'Invalid event type'], 400);
        }

        $results = [];

        foreach ($participants->get() as $participant) {

            // determine participant ID column based on event type
            $participantId = ($type === 'SOLO')
                ? $participant->user_ID
                : $participant->team_ID;

            $totalPoints = self::_CalculateTotalScore($event, $participantId);

            $results[] = [
                'participant_id' => $participantId,
                'name' => $participant->user_name ?? $participant->team_name ?? null,
                'total_points' => $totalPoints,
            ];
        }

        // sort descending by score
        usort($results, function ($a, $b) {
            return $b['total_points'] <=> $a['total_points'];
        });

        // assign placements after sorting
        $placement = 1;
        foreach ($results as &$r) {
            $r['placement'] = $placement++;
        }

        //update participants
        self::_UpdateResults($participants, $results);

        return response()->json([
            'event_id' => $event->event_ID,
            'type' => $type,
            'placements' => $results,
        ]);
    }

    // helper for DB updating
    public static function _UpdateResults($participants, array $results) : void
    {

            // update participants
        foreach ($participants as $participant) {

            // determine participant ID column based on event type
            $participantId = ($type === 'SOLO')
                ? $participant->user_ID
                : $participant->team_ID;

            // find this participant's record in $results
            $record = collect($results)->firstWhere('participant_id', $participantId);

            if (! $record) {
                continue; // should not happen, but safe fallback
            }

            // update the final score + placement
            $participant->update([
                'final_points'    => $record['total_points'],
                'final_placement' => $record['placement'],
            ]);
        }
    }


}
