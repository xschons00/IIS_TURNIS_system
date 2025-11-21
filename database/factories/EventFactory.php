<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'event_name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(12),
            'event_date' => fake()->date(),
            'location' => fake()->city(),
            'event_type' => fake()->randomElement(['SOLO','TEAM']),
            'event_state' => fake()->randomElement(['NEW','REGISTRATION','ONGOING','FINISHED']),
            'max_participants' => fake()->numberBetween(2, 128),
        ];
    }
}
