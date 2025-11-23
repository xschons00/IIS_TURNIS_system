<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventMatch extends Model
{
    use HasFactory;

    protected $table = 'event_matches';

    protected $fillable = [
        'event_ID',
        'participant_A',
        'participant_B',
        'participant_A_points',
        'participant_B_points',
        'round',
        'time',
        'winner',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_ID', 'event_ID');
    }

    public function participantA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_A', 'user_ID');
    }

    public function participantB(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_B', 'user_ID');
    }

    public function winnerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner', 'user_ID');
    }
}
