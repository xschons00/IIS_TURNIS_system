<?php

namespace Database\Factories;

use App\Models\TeamMember;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeamMember>
 */
class TeamMemberFactory extends Factory
{
    protected $model = TeamMember::class;

    public function definition(): array
    {
        return [
            // Use factories as relation placeholders; creating via ->create() will persist related models.
            'team_ID' => Team::factory(),
            'user_ID' => User::factory(),
        ];
    }
}