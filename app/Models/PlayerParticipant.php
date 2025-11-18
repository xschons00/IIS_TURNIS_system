<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PlayerParticipant extends Pivot
{
    protected $table = 'player_participants';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'event_ID',
        'user_ID',
        'final_placement',
    ];
}
