<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

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
        $data = $request->all();
        $data['event_state'] = $data['event_state'] ?? 'NEW';

        return Event::create($data);
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
        if ($event) {
            $event->update($request->all());
            return $event;
        }
        return null;
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
