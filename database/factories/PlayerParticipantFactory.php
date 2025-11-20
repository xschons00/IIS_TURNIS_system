<?php

namespace Database\Factories;

use App\Models\PlayerParticipant;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PlayerParticipant>
 */
class PlayerParticipantFactory extends Factory
{
    protected $model = PlayerParticipant::class;

    public function definition(): array
    {
        return [
            'event_ID' => Event::factory(),
            'user_ID' => User::factory(),
            'final_placement' => fake()->optional()->numberBetween(1, 100),
        ];
    }
}