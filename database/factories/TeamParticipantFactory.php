<?php

namespace Database\Factories;

use App\Models\TeamParticipant;
use App\Models\Event;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeamParticipant>
 */
class TeamParticipantFactory extends Factory
{
    protected $model = TeamParticipant::class;

    public function definition(): array
    {
        return [
            'event_ID' => Event::factory(),
            'team_ID' => Team::factory(),
            'final_placement' => fake()->optional()->numberBetween(1, 100),
        ];
    }
}