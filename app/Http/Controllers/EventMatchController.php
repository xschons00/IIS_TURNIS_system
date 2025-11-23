<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ApiResponse;

class EventMatchController 
{
    use ApiResponse;


    /**
     * PUT /api/events/{id}/matches/generate
     * Initializes empty matches for the event.
     */
    public function GenerateEventMatches(int $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $success = $this->CreateEmptyMatches($event);

        if (!$success) {
            return $this->respondWithMessage('Failed to create matches. Check participant count.', null, 400);
        }

        return $this->respondWithMessage('Matches initialized successfully', null, 201);
    }

    /**
     * helper to create empty matches for an event
     */
    private function CreateEmptyMatches(Event $event): bool
    {
        $participants = ParticipantsController::_GetParticipantCount($event);
        $allowedPlayerCounts = [2, 4, 8, 16, 32];

        if (!in_array($participants, $allowedPlayerCounts, true)) {
            return false;
        }

        $numMatches = (int) ($participants / 2);
        $eventRound = 1;

        while ($numMatches >= 1) {
            for ($i = 0; $i < $numMatches; $i++) {
                EventMatch::create([
                    'event_ID' => $event->event_ID,
                    'participant_A' => null,
                    'participant_B' => null,
                    'participant_A_points' => 0,
                    'participant_B_points' => 0,
                    'round' => $eventRound,
                    'time' => $event->event_date,
                    'winner' => null,
                ]);
            }

            $eventRound++;
            $numMatches = (int) ($numMatches / 2);
        }

        return true;
    }

    // GET /api/events/{id}/matches

    public function GetAllEventMatches(int $id): JsonResponse
    {
        $event = Event::find($id);
        if (!$event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $matches = $event->matches()->get();

        return $this->respondWithMessage(
            'Matches retrieved',
            [
                'event_id' => $event->event_ID,
                'event_name' => $event->event_name,
                'matches' => $matches,
            ]
        );
    }

    /**
     * GET /api/matches/{id}
     */
    public function GetEventMatch(int $id): JsonResponse
    {
        $match = EventMatch::find($id);

        if (!$match) {
            return $this->respondWithMessage('Match not found', null, 404);
        }

        return $this->respondWithMessage('Match retrieved', $match);
    }

    /**
     * PUT /api/matches/{id}
     */
    public function UpdateEventMatch(Request $request, int $id): JsonResponse
    {
        $match = EventMatch::find($id);

        if (!$match) {
            return $this->respondWithMessage('Match not found', null, 404);
        }

        $validated = $request->validate([
            'participant_A' => 'nullable|integer',
            'participant_B' => 'nullable|integer',
            'round' => 'nullable|integer|min:1',
            'participant_A_points' => 'nullable|integer|min:0',
            'participant_B_points' => 'nullable|integer|min:0',
            'time' => 'nullable|date',
            'winner' => [
                'nullable',
                'integer',
                function ($attribute, $value, $fail) use ($request, $match) {
                    $participantA = $request->input('participant_A', $match->participant_A);
                    $participantB = $request->input('participant_B', $match->participant_B);

                    if (!is_null($value) && $value !== $participantA && $value !== $participantB) {
                        $fail('Winner must be either participant_A or participant_B.');
                    }
                },
            ],
        ]);

        if (!empty($validated)) {
            $match->update($validated);
        }

        $match->refresh();

        return $this->respondWithMessage('Match updated', $match);
    }

    /**
     * DELETE /api/matches/{id}
     */
    public function DeleteEventMatch(int $id): JsonResponse
    {
        $match = EventMatch::find($id);

        if (!$match) {
            return $this->respondWithMessage('Match not found', null, 404);
        }

        $match->delete();

        return $this->respondWithMessage('Match deleted');
    }

    // helper to calculate final score
    public static function _CalculateTotalScore(Event $event, int $participant_ID): int
    {
        $event = Event::find($event->event_ID);
        if (!$event) {
            return 0;
        }
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
    public function GetTotalScoreForPlayer(int $event_id, int $participant_ID): JsonResponse
    {
        $event = Event::find($event_id);
        if (! $event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        $totalPoints = self::_CalculateTotalScore($event, $participant_ID);

        return $this->respondWithMessage(
            'Total points calculated',
            [
                'event_id' => $event->event_ID,
                'participant_id' => $participant_ID,
                'total_points' => $totalPoints,
            ]
        );
    }
    
    // Calculate final placement for participants of event
    public function GetFinalPlacements(int $event_id): JsonResponse
    {
        $event = Event::find($event_id);
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
            $participant->update([
                'final_points'    => $record['total_points'],
                'final_placement' => $record['placement'],
            ]);
        }
    }
            

}
