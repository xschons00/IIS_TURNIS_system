<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;
use App\Models\User;

class TeamsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = [
            [
                'team_name' => 'Cyber Falcons',
                'ranking' => 1,
                'members' => [
                    'lena.andrejova@example.com',
                    'marek.varga@example.com',
                    'boris.uhlir@example.com',
                    'denis.kovac@example.com',
                ],
            ],
            [
                'team_name' => 'Quantum Owls',
                'ranking' => 2,
                'members' => [
                    'katarina.svobodova@example.com',
                    'sofia.kralova@example.com',
                    'eva.holubova@example.com',
                ],
            ],
            [
                'team_name' => 'Pixel Titans',
                'ranking' => 3,
                'members' => [
                    'marco.hrasko@example.com',
                    'peter.novak@example.com',
                    'boris.uhlir@example.com',
                ],
            ],
        ];

        foreach ($teams as $teamData) {
            $memberEmails = $teamData['members'];
            $team = Team::updateOrCreate(
                ['team_name' => $teamData['team_name']],
                ['ranking' => $teamData['ranking']]
            );

            $userIds = User::whereIn('email', $memberEmails)->pluck('user_ID')->all();

            if (! empty($userIds)) {
                $team->members()->sync($userIds);
            }
        }
    }
}
