<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Validation\Rule;


class EventController 
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
        'entry_fee'         => 'nullable|string',
        'winner_price'      => 'nullable|string',
        'event_date'        => 'required|date',
        'location'          => 'required|string|max:255',
        'event_type'        => 'required|in:SOLO,TEAM',
        'event_leader_id'   => 'required',
        'event_winner'      => 'nullable',

        'max_participants' => [
            'required',
            'integer',
            'min:2',
            'max:32',
            function ($attribute, $value, $fail) {
                // Check power of 2: 4, 8, 16, 32
                if (!in_array($value, [2, 4, 8, 16, 32], true)) {
                    $fail('The '.$attribute.' must be one of: 4, 8, 16, 32.');
                }
            }
        ],
    ]);

    $validated['event_state'] = 'NEW';

    return Event::create($validated);
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
            'entry_fee' => 'sometimes|string',
            'winner_price' => 'sometimes|string',
            'event_date' => 'sometimes|date',
            'location' => 'sometimes|string|max:255',
            'event_type' => ['sometimes', Rule::in(['SOLO', 'TEAM'])],
            'event_state' => ['sometimes', Rule::in(['NEW', 'REGISTRATION', 'ONGOING', 'FINISHED'])],
            'max_participants' => 'sometimes|integer|min:1',
            'event_leader_id' => ['sometimes', 'exists:users,user_ID'],
            'event_winner' => ['sometimes', 'exists:users,user_ID'],
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
