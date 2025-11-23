<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventMatch;
use App\Models\Team;
use App\Models\User;
use Carbon\Carbon;

class EventsTableSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'event_name' => 'Campus Clash 2025',
                'description' => 'Lan kvalifikácia zameraná na solo hráčov univerzity.',
                'event_date' => '2025-12-01',
                'location' => 'Bratislava Science Hall',
                'event_type' => 'SOLO',
                'leader_email' => 'lena.andrejova@example.com',
                'max_participants' => 16,
                'event_state' => 'REGISTRATION',
                'participants' => [
                    ['email' => 'lena.andrejova@example.com', 'final_placement' => 1],
                    ['email' => 'marek.varga@example.com', 'final_placement' => 2],
                    ['email' => 'katarina.svobodova@example.com', 'final_placement' => 3],
                    ['email' => 'sofia.kralova@example.com', 'final_placement' => 4],
                ],
                'matches' => [
                    [
                        'participant_A' => 'lena.andrejova@example.com',
                        'participant_B' => 'sofia.kralova@example.com',
                        'round' => 1,
                        'time' => '2025-12-01 10:00:00',
                        'winner' => 'lena.andrejova@example.com',
                    ],
                    [
                        'participant_A' => 'marek.varga@example.com',
                        'participant_B' => 'katarina.svobodova@example.com',
                        'round' => 1,
                        'time' => '2025-12-01 11:00:00',
                        'winner' => 'marek.varga@example.com',
                    ],
                    [
                        'participant_A' => 'lena.andrejova@example.com',
                        'participant_B' => 'marek.varga@example.com',
                        'round' => 2,
                        'time' => '2025-12-01 15:00:00',
                        'winner' => 'lena.andrejova@example.com',
                    ],
                ],
            ],
            [
                'event_name' => 'Faculty League Finals',
                'description' => 'Finále tímovej ligy medzi jednotlivými fakultami.',
                'event_date' => '2025-12-15',
                'location' => 'University Sports Center',
                'event_type' => 'TEAM',
                'leader_email' => 'admin@digitick.test',
                'max_participants' => 12,
                'event_state' => 'FINISHED',
                'teams' => [
                    ['team_name' => 'Cyber Falcons', 'final_placement' => 1],
                    ['team_name' => 'Quantum Owls', 'final_placement' => 2],
                    ['team_name' => 'Pixel Titans', 'final_placement' => 3],
                ],
                'matches' => [],
            ],
            [
                'event_name' => 'Winter Showdown Cup',
                'description' => 'Online turnaj otvorený pre širšiu komunitu hráčov.',
                'event_date' => '2026-01-12',
                'location' => 'Online arena',
                'event_type' => 'SOLO',
                'leader_email' => 'denis.kovac@example.com',
                'max_participants' => 32,
                'event_state' => 'REGISTRATION',
                'participants' => [
                    ['email' => 'denis.kovac@example.com', 'final_placement' => 1],
                    ['email' => 'marco.hrasko@example.com', 'final_placement' => 2],
                    ['email' => 'eva.holubova@example.com', 'final_placement' => 3],
                    ['email' => 'peter.novak@example.com', 'final_placement' => 4],
                ],
                'matches' => [
                    [
                        'participant_A' => 'marco.hrasko@example.com',
                        'participant_B' => 'eva.holubova@example.com',
                        'round' => 1,
                        'time' => '2026-01-12 09:30:00',
                        'winner' => 'marco.hrasko@example.com',
                    ],
                    [
                        'participant_A' => 'denis.kovac@example.com',
                        'participant_B' => 'peter.novak@example.com',
                        'round' => 1,
                        'time' => '2026-01-12 10:30:00',
                        'winner' => 'denis.kovac@example.com',
                    ],
                    [
                        'participant_A' => 'denis.kovac@example.com',
                        'participant_B' => 'marco.hrasko@example.com',
                        'round' => 2,
                        'time' => '2026-01-12 14:00:00',
                        'winner' => 'denis.kovac@example.com',
                    ],
                ],
            ],
            [
                'event_name' => 'Duel of the Duchy',
                'description' => 'Historický šermiarsky duel v štýle duchov starých čias.',
                'event_date' => '2025-11-20',
                'location' => 'Staré Mesto',
                'event_type' => 'SOLO',
                'leader_email' => 'admin@digitick.test',
                'max_participants' => 8,
                'event_state' => 'REGISTRATION',
                'participants' => [
                    ['email' => 'admin@digitick.test', 'final_placement' => 1],
                ],
                'matches' => [],
            ],
            [
                'event_name' => 'Duel Duchov 2v2',
                'description' => 'Tímový duel duchov - rýchle zápasy v pároch.',
                'event_date' => '2025-11-25',
                'location' => 'Hradná Sieň',
                'event_type' => 'TEAM',
                'leader_email' => 'admin@digitick.test',
                'max_participants' => 4,
                'event_state' => 'REGISTRATION',
                'teams' => [
                    ['team_name' => 'Cyber Falcons', 'final_placement' => 1],
                ],
                'matches' => [],
            ],
        ];

        foreach ($events as $eventData) {

            // Resolve leader
            $leader = User::where('email', $eventData['leader_email'])->firstOrFail();

            // Create event
            $event = Event::updateOrCreate(
                ['event_name' => $eventData['event_name']],
                [
                    'description' => $eventData['description'],
                    'event_date' => $eventData['event_date'],
                    'location' => $eventData['location'],
                    'event_type' => $eventData['event_type'],
                    'max_participants' => $eventData['max_participants'],
                    'event_leader_id' => $leader->user_ID,
                    'event_state' => $eventData['event_state'],
                ]
            );

            //
            // SOLO participants → player_participants pivot
            //
            if ($eventData['event_type'] === 'SOLO') {
                $pivot = [];

                foreach ($eventData['participants'] ?? [] as $p) {
                    $user = User::where('email', $p['email'])->first();
                    if (!$user) continue;

                    $pivot[$user->user_ID] = [
                        'final_placement' => $p['final_placement'],
                        'status' => 'ACCEPTED',
                    ];
                }

                $event->players()->sync($pivot);
            }

            //
            // TEAM participants → team_participants pivot
            //
            if ($eventData['event_type'] === 'TEAM') {
                $pivot = [];

                foreach ($eventData['teams'] ?? [] as $t) {
                    $team = Team::where('team_name', $t['team_name'])->first();
                    if (!$team) continue;

                    $pivot[$team->team_ID] = [
                        'final_placement' => $t['final_placement'],
                        'status' => 'ACCEPTED',
                    ];
                }

                $event->teams()->sync($pivot);
            }

            //
            // Matches
            //
            EventMatch::where('event_ID', $event->event_ID)->delete();

            foreach ($eventData['matches'] ?? [] as $m) {

                $userA = User::where('email', $m['participant_A'])->first();
                $userB = User::where('email', $m['participant_B'])->first();
                if (!$userA || !$userB) continue;

                $winnerId = optional(User::where('email', $m['winner'])->first())->user_ID;

                EventMatch::create([
                    'event_ID' => $event->event_ID,
                    'participant_A' => $userA->user_ID,
                    'participant_B' => $userB->user_ID,
                    'round' => $m['round'],
                    'time' => Carbon::parse($m['time']),
                    'winner' => $winnerId,
                ]);
            }
        }
    }
}
