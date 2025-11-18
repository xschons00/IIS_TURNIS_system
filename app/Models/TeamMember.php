<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TeamMember extends Pivot
{
    protected $table = 'team_members';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'team_ID',
        'user_ID',
    ];
}
