<?php

namespace Database\Factories;

use App\Models\EventMatch;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventMatch>
 */
class EventMatchFactory extends Factory
{
    protected $model = EventMatch::class;

    public function definition(): array
    {
        return [
            'event_ID' => Event::factory(),
            'participant_A' => User::factory(),
            'participant_B' => User::factory(),
            'round' => fake()->numberBetween(1, 5),
            'time' => fake()->dateTimeBetween('-1 month', '+1 month'),
            // winner may be null or one of the participants; default null
            'winner' => null,
        ];
    }

    /**
     * Set a winner (convenience state).
     */
    public function withWinner(): static
    {
        return $this->state(function (array $attributes) {
            // if A and B are factories they will be resolved on create()
            return ['winner' => $attributes['participant_A'] ?? User::factory()];
        });
    }
}
