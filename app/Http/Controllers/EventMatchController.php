<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventMatchController 
{

    /**
     * PUT /api/events/{id}/matches/generate
     * Initializes empty matches for the event.
     */
    public function GenerateEventMatches(int $id): JsonResponse
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $success = $this->CreateEmptyMatches($event);

        if (!$success) {
            return response()->json(['message' => 'Failed to create matches. Check participant count.'], 400);
        }

        return response()->json(['message' => 'Matches initialized successfully'], 201);
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
            return response()->json(['message' => 'Event not found'], 404);
        }

        $matches = $event->matches()->get();

        return response()->json([
            'event_id' => $event->event_ID,
            'event_name' => $event->event_name,
            'matches' => $matches,
        ]);
    }

    /**
     * GET /api/matches/{id}
     */
    public function GetEventMatch(int $id): JsonResponse
    {
        $match = EventMatch::find($id);

        if (!$match) {
            return response()->json(['message' => 'Match not found'], 404);
        }

        return response()->json($match);
    }

    /**
     * PUT /api/matches/{id}
     */
    public function UpdateEventMatch(Request $request, int $id): JsonResponse
    {
        $match = EventMatch::find($id);

        if (!$match) {
            return response()->json(['message' => 'Match not found'], 404);
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

        return response()->json($match);
    }

    /**
     * DELETE /api/matches/{id}
     */
    public function DeleteEventMatch(int $id): JsonResponse
    {
        $match = EventMatch::find($id);

        if (!$match) {
            return response()->json(['message' => 'Match not found'], 404);
        }

        $match->delete();

        return response()->json(['message' => 'Match deleted']);
    }

}
