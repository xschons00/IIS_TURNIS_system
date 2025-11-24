<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventMatch;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\ParticipantsController;
use App\Http\Controllers\EventMatchController;
use Illuminate\Support\Facades\DB;


class EventController 
{
    use ApiResponse;

    /**
     * Resource-style method: list all events.
     */
    public function GetAllEvents(): JsonResponse
    {
        return $this->respondWithMessage('Events retrieved', Event::all());
    }

    /**
     * Resource-style method: store a new event.
     */

    public function SaveEvent(Request $request): JsonResponse
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

    return $this->respondWithMessage('Event created', Event::create($validated), 201);
    }

    /**
     * Resource-style method: show a single event.
     */
    public function GetEvent(string $id): JsonResponse
    {
        $event = Event::find($id);

        if (! $event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        return $this->respondWithMessage('Event retrieved', $event);
    }

    public function UpdateEvent(Request $request, string $id): JsonResponse
    {
        $event = Event::find($id);
        if (! $event) {
            return $this->respondWithMessage('Event not found', null, 404);
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

        return $this->respondWithMessage('Event updated', $event);
    }

    /**
     * Resource-style method: delete a event.
     */

    public function DeleteEvent(string $id): JsonResponse
    {
        $event = Event::find($id);
        if ($event) {
            $event->delete();
            return $this->respondWithMessage('Event deleted');
        }

        return $this->respondWithMessage('Event not found', null, 404);
    }

    /**
     * Start tournament (event leader/admin).
     * Sets state to ONGOING and generates empty bracket matches.
     */
    public function StartEvent(int $id): JsonResponse
    {
        $event = Event::find($id);

        if (! $event) {
            return $this->respondWithMessage('Event not found', null, 404);
        }

        if (in_array($event->event_state, ['ONGOING', 'FINISHED'], true)) {
            return $this->respondWithMessage('Event already started', $event, 400);
        }

        $participantCount = ParticipantsController::_GetParticipantCount($event, onlyAccepted: true);
        $allowed = [2, 4, 8, 16, 32];
        if (! in_array($participantCount, $allowed, true)) {
            return $this->respondWithMessage('Invalid participant count to start event', null, 400);
        }

        // reset existing matches before creating new bracket
        EventMatch::where('event_ID', $event->event_ID)->delete();

        $success = EventMatchController::CreateEmptyMatches($event);
        if (! $success) {
            return $this->respondWithMessage('Failed to create matches. Check participant count.', null, 400);
        }

        $this->removePendingParticipants($event);

        $event->update(['event_state' => 'ONGOING']);

        return $this->respondWithMessage('Event started', $event);
    }

    private function removePendingParticipants(Event $event): void
    {
        DB::transaction(function () use ($event) {
            if (strtoupper($event->event_type ?? '') === 'SOLO') {
                $event->players()->wherePivot('status', 'REQUESTED')->detach();
            } else {
                $event->teams()->wherePivot('status', 'REQUESTED')->detach();
            }
        });
    }
}
