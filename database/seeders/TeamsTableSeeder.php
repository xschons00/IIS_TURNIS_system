<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;
use App\Models\User;

class TeamsTableSeeder extends Seeder
{
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

        foreach ($teams as $data) {

            // Leader must exist in users (from UsersTableSeeder)
            $leader = User::where('email', $data['leader_email'])->firstOrFail();

            // Create/update team
            $team = Team::updateOrCreate(
                ['team_name' => $data['team_name']],
                [
                    'ranking' => $data['ranking'],
                    'team_leader_id' => $leader->user_ID,
                ]
            );

            // Resolve member IDs by email
            $memberIds = User::whereIn('email', $data['members'])
                ->pluck('user_ID')
                ->all();

            // Sync pivot entries
            $team->members()->sync($memberIds);
        }
    }
}
