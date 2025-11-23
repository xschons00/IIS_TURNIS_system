<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TeamParticipant extends Pivot
{
    protected $table = 'team_participants';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'event_ID',
        'team_ID',
        'final_placement',
        'final_points',
    ];
}
