<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventMatch;
use App\Models\User;
use App\Models\Team;
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

        $success = self::CreateEmptyMatches($event);

        if (!$success) {
            return $this->respondWithMessage('Failed to create matches. Check participant count.', null, 400);
        }

        return $this->respondWithMessage('Matches initialized successfully', null, 201);
    }

    /**
     * helper to create empty matches for an event
     */
    public static function CreateEmptyMatches(Event $event): bool
    {
        $participants = ParticipantsController::_GetParticipantCount($event, onlyAccepted: true);
        $allowedPlayerCounts = [2, 4, 8, 16, 32];

        if (!in_array($participants, $allowedPlayerCounts, true)) {
            return false;
        }

        // Get ordered participant IDs (accepted only)
        if (strtoupper($event->event_type) === 'SOLO') {
            $participantIds = $event->players()
                ->wherePivot('status', 'ACCEPTED')
                ->pluck('users.user_ID')
                ->toArray();
        } else {
            $participantIds = $event->teams()
                ->wherePivot('status', 'ACCEPTED')
                ->pluck('teams.team_ID')
                ->toArray();
        }

        if (count($participantIds) !== $participants) {
            return false;
        }

        $numMatches = (int) ($participants / 2);
        $eventRound = 1;
        $currentRoundParticipants = $participantIds;

        while ($numMatches >= 1) {
            for ($i = 0; $i < $numMatches; $i++) {
                $participantA = $eventRound === 1 ? ($currentRoundParticipants[$i * 2] ?? null) : null;
                $participantB = $eventRound === 1 ? ($currentRoundParticipants[$i * 2 + 1] ?? null) : null;

                EventMatch::create([
                    'event_ID' => $event->event_ID,
                    'participant_A' => $participantA,
                    'participant_B' => $participantB,
                    'participant_A_points' => 0,
                    'participant_B_points' => 0,
                    'round' => $eventRound,
                    'time' => $event->event_date,
                    'winner' => null,
                ]);
            }

            $eventRound++;
            $numMatches = (int) ($numMatches / 2);
            // Placeholder participants for next rounds (winners will be filled later)
            $currentRoundParticipants = array_fill(0, max(0, $numMatches * 2), null);
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

        // Ensure winner gets at least 1 point in the current match
        if ($match->winner) {
            if ($match->winner === $match->participant_A && ($match->participant_A_points ?? 0) < 1) {
                $match->update(['participant_A_points' => 1]);
                $match->refresh();
            } elseif ($match->winner === $match->participant_B && ($match->participant_B_points ?? 0) < 1) {
                $match->update(['participant_B_points' => 1]);
                $match->refresh();
            }
        }

        // If a winner is set/cleared, propagate to the next round bracket slot
        $this->propagateWinnerToNextMatch($match);
        // If bracket is complete, finish the event
        $this->finalizeEventIfCompleted($match);

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

    /**
     * Propagate winner of a match into the next round slot.
     * Positions are determined by match order (ascending ID) within each round.
     */
    private function propagateWinnerToNextMatch(EventMatch $match): void
    {
        // Only propagate when we have a winner
        $winnerId = $match->winner;
        $eventId = $match->event_ID;

        if (! $eventId) {
            return;
        }

        $currentRound = (int) $match->round;
        if ($currentRound <= 0) {
            return;
        }

        $nextRound = $currentRound + 1;

        // Determine index of current match within its round (by ID ordering)
        $currentRoundMatches = EventMatch::where('event_ID', $eventId)
            ->where('round', $currentRound)
            ->orderBy('id')
            ->get()
            ->values();

        $currentIndex = $currentRoundMatches->search(function ($m) use ($match) {
            return $m->id === $match->id;
        });

        if ($currentIndex === false) {
            return;
        }

        // Find the corresponding match in the next round
        $nextRoundMatches = EventMatch::where('event_ID', $eventId)
            ->where('round', $nextRound)
            ->orderBy('id')
            ->get()
            ->values();

        if ($nextRoundMatches->isEmpty()) {
            return; // last round
        }

        $nextMatchIndex = intdiv($currentIndex, 2);
        $slot = $currentIndex % 2 === 0 ? 'participant_A' : 'participant_B';

        /** @var EventMatch|null $nextMatch */
        $nextMatch = $nextRoundMatches->get($nextMatchIndex);
        if (! $nextMatch) {
            return;
        }

        if ($winnerId === null) {
            // Clear slot if winner removed
            $nextMatch->update([$slot => null]);
            return;
        }

        $nextMatch->update([$slot => $winnerId]);

        // Assign advancement point to winner for this match
        $pointsField = $slot === 'participant_A' ? 'participant_A_points' : 'participant_B_points';
        $nextMatch->update([$pointsField => max((int) ($nextMatch->$pointsField ?? 0), 1)]);
    }

    /**
     * If all matches in the event have winners, mark event as finished and set winner for solo events.
     */
    private function finalizeEventIfCompleted(EventMatch $match): void
    {
        $event = Event::find($match->event_ID);
        if (! $event || $event->event_state === 'FINISHED') {
            return;
        }

        $matches = EventMatch::where('event_ID', $event->event_ID)->get();
        if ($matches->isEmpty()) {
            return;
        }

        // All matches must have a winner
        if ($matches->contains(fn ($m) => $m->winner === null)) {
            return;
        }

        $finalRound = $matches->max('round');
        $finalMatch = $matches->firstWhere('round', $finalRound);
        if (! $finalMatch || $finalMatch->winner === null) {
            return;
        }

        $update = ['event_state' => 'FINISHED'];
        if (strtoupper($event->event_type ?? '') === 'SOLO') {
            $update['event_winner'] = $finalMatch->winner;
        }

        $event->update($update);

        $this->awardRankingPoints($event);
    }

    /**
     * Award ranking points based on final match points when event finishes.
     * Applies the total points accumulated in matches to participant ranking.
     */
    private function awardRankingPoints(Event $event): void
    {
        $type = strtoupper($event->event_type ?? '');
        $matches = $event->matches()->get();
        if ($matches->isEmpty()) {
            return;
        }

        $finalRound = $matches->max('round');
        $finalMatch = $matches->firstWhere('round', $finalRound);
        if (! $finalMatch || ! $finalMatch->winner) {
            return;
        }

        if ($type === 'SOLO') {
            $winner = $event->players()->where('users.user_ID', $finalMatch->winner)->first();
            if ($winner) {
                $points = ParticipantsController::_CalculateTotalScore($event, $winner->user_ID);
                if ($points > 0) {
                    $winner->increment('ranking', $points);
                }
            }
        } elseif ($type === 'TEAM') {
            $winnerTeam = $event->teams()->where('teams.team_ID', $finalMatch->winner)->first();
            if ($winnerTeam) {
                $points = ParticipantsController::_CalculateTotalScore($event, $winnerTeam->team_ID);
                if ($points > 0) {
                    $winnerTeam->increment('ranking', $points);
                }
            }
        }
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
