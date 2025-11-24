<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'user_name' => 'admin',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@digitick.test',
                'password' => Hash::make('password'),
                'faculty' => 'COMPUTER_SCIENCE',
                'ranking' => null,
                'role' => 'ADMIN',
            ],
            [
                'user_name' => 'lena.andrejova',
                'first_name' => 'Lena',
                'last_name' => 'Andrejova',
                'email' => 'lena.andrejova@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'ENGINEERING',
                'ranking' => 1850,
                'role' => 'USER',
            ],
            [
                'user_name' => 'marek.varga',
                'first_name' => 'Marek',
                'last_name' => 'Varga',
                'email' => 'marek.varga@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'COMPUTER_SCIENCE',
                'ranking' => 1780,
                'role' => 'USER',
            ],
            [
                'user_name' => 'katarina.svobodova',
                'first_name' => 'Katarina',
                'last_name' => 'Svobodova',
                'email' => 'katarina.svobodova@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'BUSINESS',
                'ranking' => 1620,
                'role' => 'USER',
            ],
            [
                'user_name' => 'boris.uhlir',
                'first_name' => 'Boris',
                'last_name' => 'Uhlir',
                'email' => 'boris.uhlir@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'ENGINEERING',
                'ranking' => 1710,
                'role' => 'USER',
            ],
            [
                'user_name' => 'sofia.kralova',
                'first_name' => 'Sofia',
                'last_name' => 'Kralova',
                'email' => 'sofia.kralova@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'ARTS',
                'ranking' => 1505,
                'role' => 'USER',
            ],
            [
                'user_name' => 'marco.hrasko',
                'first_name' => 'Marco',
                'last_name' => 'Hrasko',
                'email' => 'marco.hrasko@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'CHEMISTRY',
                'ranking' => 1580,
                'role' => 'USER',
            ],
            [
                'user_name' => 'denis.kovac',
                'first_name' => 'Denis',
                'last_name' => 'Kovac',
                'email' => 'denis.kovac@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'COMPUTER_SCIENCE',
                'ranking' => 1675,
                'role' => 'USER',
            ],
            [
                'user_name' => 'eva.holubova',
                'first_name' => 'Eva',
                'last_name' => 'Holubova',
                'email' => 'eva.holubova@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'BUSINESS',
                'ranking' => 1420,
                'role' => 'USER',
            ],
            [
                'user_name' => 'peter.novak',
                'first_name' => 'Peter',
                'last_name' => 'Novak',
                'email' => 'peter.novak@example.com',
                'password' => Hash::make('password'),
                'faculty' => 'ENGINEERING',
                'ranking' => 1600,
                'role' => 'USER',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['user_name' => $user['user_name']],
                $user + ['email_verified_at' => now()]
            );
        }
    }
}
