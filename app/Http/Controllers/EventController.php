<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    /**
     * Resource-style method: list all events.
     */
    public function GetAllevents()
    {
        return Event::all();
    }

    /**
     * Resource-style method: store a new event.
     */

    public function Saveevent(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'description' => 'required|string',
            'event_date' => 'required|date',
            'location' => 'required|string|max:255',
            'event_type' => ['required', Rule::in(['SOLO', 'TEAM'])],
            'event_state' => ['sometimes', Rule::in(['NEW', 'REGISTRATION', 'ONGOING', 'FINISHED'])],
            'max_participants' => 'required|integer|min:1',
            'event_leader_id' => 'required|exists:users,user_ID',
        ]);

        $validated['event_state'] = $validated['event_state'] ?? 'NEW';

        return Event::create($validated);
    }

    /**
     * Resource-style method: show a single event.
     */
    public function Getevent(string $id)
    {
        return Event::find($id);
    }

    public function Updateevent(Request $request, string $id)
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

    public function Deleteevent(string $id)
    {
        $event = Event::find($id);
        if ($event) {
            $event->delete();
            return true;
        }
        return false;
    }
}
