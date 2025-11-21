<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    use HasFactory;

    protected $primaryKey = 'team_ID';
    public $incrementing = true;
    public $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'team_name',
        'ranking',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'team_members',
            'team_ID',
            'user_ID'
        )->using(TeamMember::class);
    }

    // events the team participates in
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(
            Event::class,
            'team_participants',
            'team_ID',
            'event_ID'
        )->withPivot('final_placement')
         ->using(TeamParticipant::class);
    }
}
