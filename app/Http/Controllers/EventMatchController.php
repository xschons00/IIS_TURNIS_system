<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventMatch;
use Illuminate\Validation\Rule;
use App\Http\Controllers\ParicipantsController;

class EventMatchController extends Controller
{

    /**
     * POST /api/events/{id}/initialize-matches
     * Initializes empty matches for the event.
     * @return Illuminate\Http\JsonResponse
     */
    public function GenerateEventMatches(Request $request, int $id): iluminate\Http\JsonResponse
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
    
    // helper to create empty matches for an event
    private function CreateEmptyMatches(Event $event): bool
    {
        $particimants = PaticipantsController::_GetParticipantCount($event);
        
        $allowedPlayerCounts = array(2, 4, 8, 16, 32);
        if (in_array($particimants, $allowedPlayerCounts, false)) { // must be even number and at least 2
            return false;
        }


        $numMatches = $particimants / 2; // Each match has 2 participants
        $eventRound = 1; // Start from the first round

        while ($numMatches !== 1) { // Continue until there's only one match left (the final)
            for ($i = 0; $i < $numMatches; $i++) {
                EventMatch::create([
                'event_ID' => $event->event_ID,
                'participant_A' => null,
                'participant_B' => null,
                'round' => $eventRound,
                'time' => $event->event_date,
                'winner' => null,
                ]);

            }
            $eventRound++;
            $numMatches = $numMatches / 2;
        }
        return true;

    }

    // GET /api/events/{id}/matches

    public function GetAllEventMatches(Request $request, int $id)
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
     * Resource-style method: show a single match.
     */

    public function GetEventMatch(string $id)
    {
        return EventMatch::find($id);
    }

    /**
     * Resource-style method: show a single match.
     * update match info
     * PUT /api/matches/{id}
     */

    public function UpdateEventMatch(Request $request, int $id)
    {
        $match = EventMatch::find($id);
        if (! $match) {
            return null;
        }
        $validated = $request->validate([
            'participant_A' => 'nullable|integer',
            'participant_B' => 'nullable|integer',
            'round'         => 'nullable|integer|min:1',
            'time'          => 'nullable|date',
            'winner'        => [
                'nullable',
                'integer',
                function ($attribute, $value, $fail) use ($request) {
                    $a = $request->input('participant_A');
                    $b = $request->input('participant_B');

                    // If winner is set, it must be one of the participants
                    if (!is_null($value) && $value !== $a && $value !== $b) {
                        $fail('Winner must be either participant_A or participant_B.');
                    }
                }
            ],
        ]);
        if (! empty($validated)) {
            $match->update($validated);
        }
        return $match;
    }

    /**
     * Resource-style method: delete a match.
     */
    public function DeleteEventMatch(string $id): void
    {
        $match = EventMatch::find($id);
        if (! $match) {
            return;
        }
        $match->delete();
     }

}