<?php


namespace App\Http\Controllers;

use App\Models\PlayerParticipant;
use App\Models\TeamParticipant;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;
use App\Http\Controllers\Concerns\ApiResponse;

class ParticipantsController 
{
    use ApiResponse;


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
            return $this->respondWithMessage('Event not found', null, 404);
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
            return $this->respondWithMessage(
                'Unknown event type',
                ['event_type' => $event->event_type],
                400
            );
        }

        return $this->respondWithMessage(
            'Participants retrieved',
            [
                'event_id' => $event->event_ID,
                'event_name' => $event->event_name,
                'event_type' => $type,
                'participants' => $participants,
            ]
        );
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
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $type = strtoupper($event->event_type ?? '');

        $count = self::_GetParticipantCount($event);

        return $this->respondWithMessage(
            'Participant count retrieved',
            [
                'event_id' => $event->event_ID,
                'event_type' => $type,
                'participants' => $count,
            ]
        );
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
            return $this->respondWithMessage('Unauthenticated', null, 401);
        }

        $event = Event::find($id);

        if (!$event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $alreadyRegistered = $event->players()
                ->where('users.user_ID', $user->user_ID)
                ->exists();

            if ($alreadyRegistered) {
                return $this->respondWithMessage('Player already registered', null, 409);
            }

            if ($event->players()->count() >= $event->max_participants) {
                return $this->respondWithMessage('Event is full', null, 409);
            }

            PlayerParticipant::create([
                'event_ID' => $event->event_ID,
                'user_ID' => $user->user_ID,
                'status' => 'REQUESTED',
            ]);
        } elseif ($type === 'TEAM') {
            $team = Team::where('team_leader_id', $user->user_ID)->first();

            if (!$team) {
                return $this->respondWithMessage('Team not found', null, 404);
            }

            $alreadyRegistered = $event->teams()
                ->where('teams.team_ID', $team->team_ID)
                ->exists();

            if ($alreadyRegistered) {
                return $this->respondWithMessage('Team already registered', null, 409);
            }

            if ($event->teams()->count() >= $event->max_participants) {
                return $this->respondWithMessage('Event is full', null, 409);
            }

            TeamParticipant::create([
                'event_ID' => $event->event_ID,
                'team_ID' => $team->team_ID,
                'status' => 'REQUESTED',
            ]);
        } else {
            return $this->respondWithMessage(
                'Unknown event type',
                ['event_type' => $event->event_type],
                400
            );
        }

        return $this->respondWithMessage('Registration submitted');
    }

    public function RemoveParticipant(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $this->respondWithMessage('Unauthenticated', null, 401);
        }

        $event = Event::find($id);

        if (!$event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $registered = PlayerParticipant::where('event_ID', $event->event_ID)
                ->where('user_ID', $user->user_ID)
                ->exists();

            if (!$registered) {
                return $this->respondWithMessage('Player not registered', null, 409);
            }

            PlayerParticipant::where('event_ID', $event->event_ID)
                ->where('user_ID', $user->user_ID)
                ->delete();
        } elseif ($type === 'TEAM') {
            $team = Team::where('team_leader_id', $user->user_ID)->first();

            if (!$team) {
                return $this->respondWithMessage('Team not found', null, 404);
            }

            $registered = TeamParticipant::where('event_ID', $event->event_ID)
                ->where('team_ID', $team->team_ID)
                ->exists();

            if (!$registered) {
                return $this->respondWithMessage('Team not registered', null, 409);
            }

            TeamParticipant::where('event_ID', $event->event_ID)
                ->where('team_ID', $team->team_ID)
                ->delete();

        } else {
            return $this->respondWithMessage(
                'Unknown event type',
                ['event_type' => $event->event_type],
                400
            );
        }

        return $this->respondWithMessage('Registration removed');
    }



     // helper to calculate final score
    public static function _CalculateTotalScore(Event $event, int $participant_ID): int
    {
        // get participant if exists
        $type = strtoupper($event->event_type ?? '');
        if ($type === 'SOLO') {
            $participant = $event->players()->where('users.user_ID', $participant_ID)->first();
        } elseif ($type === 'TEAM') {
            $participant = $event->teams()->where('teams.team_ID', $participant_ID)->first();
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
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $totalPoints = self::_CalculateTotalScore($event, $participant_id);

        return $this->respondWithMessage(
            'Total points calculated',
            [
                'event_id' => $event->event_ID,
                'participant_id' => $participant_id,
                'total_points' => $totalPoints,
            ]
        );
    }
    
    // Calculate final placement for participants of event
    public function GetFinalPlacements(int $id): JsonResponse
    {
        $event = Event::find($id);
        if (! $event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $type = strtoupper($event->event_type ?? '');

        if ($type === 'SOLO') {
            $participants = $event->players()->get();
        } elseif ($type === 'TEAM') {
            $participants = $event->teams()->get();
        } else {
            return $this->respondWithMessage('Invalid event type', null, 400);
        }

        $results = [];

        foreach ($participants->all() as $participant) {

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
        self::_UpdateResults($participants, $results, $type);

        return $this->respondWithMessage(
            'Final placements calculated',
            [
                'event_id' => $event->event_ID,
                'type' => $type,
                'placements' => $results,
            ]
        );
    }

    // helper for DB updating
    public static function _UpdateResults($participants, array $results, string $type) : void
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
            $participant->pivot->update([
                'final_points'    => $record['total_points'],
                'final_placement' => $record['placement'],
            ]);
        }
    }


}
