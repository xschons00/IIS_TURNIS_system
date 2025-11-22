<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventMatch;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    /**
     * Resource-style method: list all events.
     */
    public function GetAllEvents()
    {
        return Event::all();
    }

    /**
     * Resource-style method: store a new event.
     */

    public function SaveEvent(Request $request)
    {
    $validated = $request->validate([
        'event_name'        => 'required|string|max:255',
        'description'       => 'nullable|string',
        'event_date'        => 'required|date',
        'location'          => 'required|string|max:255',
        'event_type'        => 'required|in:SOLO,TEAM',
        'event_leader_id'   => 'required',

        'max_participants' => [
            'required',
            'integer',
            'min:4',
            'max:32',
            function ($attribute, $value, $fail) {
                // Check power of 2: 4, 8, 16, 32
                if (!in_array($value, [4, 8, 16, 32], true)) {
                    $fail('The '.$attribute.' must be one of: 4, 8, 16, 32.');
                }
            }
        ],
    ]);

    $validated['event_state'] = 'NEW';

    return Event::create($validated);
    }

    // helper to create empty matches for an event
    private function CreateEmptyMatches(Event $event): void
    {
        $maxParticipants = $event->max_participants;
        $numMatches = $maxParticipants / 2; // Each match has 2 participants
        for ($i = 0; $i < $numMatches; $i++) {
            EventMatch::create([
                'event_ID' => $event->event_ID,
                'match_number' => $i + 1,
                'player1_ID' => null,
                'player2_ID' => null,
                'team1_ID' => null,
                'team2_ID' => null,
                'winner_ID' => null,
                'match_state' => 'PENDING',
            ]);
        }

    }

    /**
     * Resource-style method: show a single event.
     */
    public function GetEvent(string $id)
    {
        return Event::find($id);
    }

    public function UpdateEvent(Request $request, string $id)
    {
        $event = Event::find($id);
        if (! $event) {
            return null;
        }

        $validated = $request->validate([
            'event_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'event_date' => 'sometimes|date',
            'location' => 'sometimes|string|max:255',
            'event_type' => ['sometimes', Rule::in(['SOLO', 'TEAM'])],
            'event_state' => ['sometimes', Rule::in(['NEW', 'REGISTRATION', 'ONGOING', 'FINISHED'])],
            'max_participants' => 'sometimes|integer|min:1',
            'event_leader_id' => ['sometimes', 'exists:users,user_ID'],
        ]);

        if (! empty($validated)) {
            $event->update($validated);
        }

        return $event;
    }

    /**
     * Resource-style method: delete a event.
     */

    public function DeleteEvent(string $id)
    {
        $event = Event::find($id);
        if ($event) {
            $event->delete();
            return true;
        }
        return false;
    }
}
