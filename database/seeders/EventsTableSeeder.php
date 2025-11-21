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
    /**
     * Run the database seeds.
     */
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
        ];

        foreach ($events as $eventData) {
            $participants = $eventData['participants'] ?? [];
            $teams = $eventData['teams'] ?? [];
            $matches = $eventData['matches'] ?? [];
            $leaderEmail = $eventData['leader_email'] ?? null;
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

            $event = Event::updateOrCreate(
                ['event_name' => $eventData['event_name']],
                [
                    'description' => $eventData['description'],
                    'event_date' => $eventData['event_date'],
                    'location' => $eventData['location'],
                    'event_type' => $eventData['event_type'],
                    'max_participants' => $eventData['max_participants'],
                    'event_leader_id' => $leader->user_ID,
                    'event_state' => $eventData['event_state'] ?? 'NEW',
                ]
            );

            if (! empty($participants)) {
                $pivotData = [];
                foreach ($participants as $participant) {
                    $user = User::where('email', $participant['email'])->first();
                    if (! $user) {
                        continue;
                    }

                    $pivotData[$user->user_ID] = [
                        'final_placement' => $participant['final_placement'],
                    ];
                }

                $event->players()->sync($pivotData);
            } else {
                $event->players()->detach();
            }

            if (! empty($teams)) {
                $pivotData = [];
                foreach ($teams as $teamInfo) {
                    $team = Team::where('team_name', $teamInfo['team_name'])->first();
                    if (! $team) {
                        continue;
                    }

                    $pivotData[$team->team_ID] = [
                        'final_placement' => $teamInfo['final_placement'],
                    ];
                }

                $event->teams()->sync($pivotData);
            } else {
                $event->teams()->detach();
            }

            EventMatch::where('event_ID', $event->event_ID)->delete();

            if (! empty($matches)) {
                foreach ($matches as $match) {
                    $participantA = User::where('email', $match['participant_A'])->first();
                    $participantB = User::where('email', $match['participant_B'])->first();

                    if (! $participantA || ! $participantB) {
                        continue;
                    }

                    $winnerId = null;
                    if (! empty($match['winner'])) {
                        $winnerId = optional(User::where('email', $match['winner'])->first())->user_ID;
                    }

                    EventMatch::updateOrCreate(
                        [
                            'event_ID' => $event->event_ID,
                            'participant_A' => $participantA->user_ID,
                            'participant_B' => $participantB->user_ID,
                        ],
                        [
                            'round' => $match['round'],
                            'time' => Carbon::parse($match['time']),
                            'winner' => $winnerId,
                        ]
                    );
                }
            }
        }
    }
}
