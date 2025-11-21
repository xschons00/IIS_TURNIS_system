<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Team>
 */
class TeamFactory extends Factory
{
    protected $model = Team::class;

    public function definition(): array
    {
        return [
            'team_name' => fake()->unique()->words(2, true),
            'ranking' => fake()->optional()->numberBetween(0, 5000),
            'team_leader_id' => User::factory(),
        ];
    }
}
