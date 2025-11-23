<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $primaryKey = 'event_ID';
    public $incrementing = true;
    public $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'event_name',
        'description',
        'entry_fee',
        'winner_price',
        'event_date',
        'location',
        'event_type',
        'event_state',
        'max_participants',
        'event_leader_id',
    ];

    protected $attributes = [
        'event_state' => 'NEW',
    ];

    // users in solo events
    public function players(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'player_participants',
            'event_ID',
            'user_ID'
        )->withPivot('final_placement')->withPivot('final_points')->withPivot('status')
         ->using(PlayerParticipant::class);
    }

    // teams in team events
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(
            Team::class,
            'team_participants',
            'event_ID',
            'team_ID'
        )->withPivot('final_placement')->withPivot('final_points')->withPivot('status')
         ->using(TeamParticipant::class);
    }

    // matches for this event
    public function matches(): HasMany
    {
        return $this->hasMany(EventMatch::class, 'event_ID', 'event_ID');
    }

    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'event_leader_id', 'user_ID');
    }
}
