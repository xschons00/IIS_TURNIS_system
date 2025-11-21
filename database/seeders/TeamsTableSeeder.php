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
                'leader_email' => 'lena.andrejova@example.com',
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
                'leader_email' => 'katarina.svobodova@example.com',
                'members' => [
                    'katarina.svobodova@example.com',
                    'sofia.kralova@example.com',
                    'eva.holubova@example.com',
                ],
            ],
            [
                'team_name' => 'Pixel Titans',
                'ranking' => 3,
                'leader_email' => 'marco.hrasko@example.com',
                'members' => [
                    'marco.hrasko@example.com',
                    'peter.novak@example.com',
                    'boris.uhlir@example.com',
                ],
            ],
        ];

        foreach ($teams as $teamData) {
            $memberEmails = $teamData['members'];
            $leaderEmail = $teamData['leader_email'] ?? ($memberEmails[0] ?? null);
            $leader = null;

            if ($leaderEmail) {
                $leader = User::where('email', $leaderEmail)->first();
            }

            if (! $leader) {
                $leader = User::first();
            }

            if (! $leader) {
                $leader = User::factory()->create();
            }

            $team = Team::updateOrCreate(
                ['team_name' => $teamData['team_name']],
                [
                    'ranking' => $teamData['ranking'],
                    'team_leader_id' => $leader->user_ID,
                ]
            );

            $userIds = User::whereIn('email', $memberEmails)->pluck('user_ID')->all();

            if (! empty($userIds)) {
                $team->members()->sync($userIds);
            }
        }
    }
}
