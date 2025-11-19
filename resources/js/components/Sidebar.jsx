import React from 'react';

function Sidebar() {
    const stats = [
        { label: 'Aktívne turnaje', value: '3' },
        { label: 'Registrovaní hráči', value: '247' },
        { label: 'Tímy', value: '42' },
        { label: 'Odohraté zápasy', value: '1,234' },
    ];

    const topPlayers = [
        { name: 'Peter Novák', points: '2,450 b.' },
        { name: 'Jana Svobodová', points: '2,380 b.' },
        { name: 'Martin Horák', points: '2,320 b.' },
    ];

    return (
        <div className="flex flex-col gap-5">
            {/* Stats Box */}
            <div className="border border-blue-200 p-5 rounded-lg bg-white shadow-md">
                <div className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-200 text-blue-900">
                    📊 Štatistiky
                </div>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="flex justify-between py-3 border-b border-blue-100 last:border-b-0 text-blue-700"
                    >
                        <span>{stat.label}</span>
                        <span className="font-bold text-blue-900">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Top Players Box */}
            <div className="border border-blue-200 p-5 rounded-lg bg-white shadow-md">
                <div className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-200 text-blue-900">
                    🏅 Top hráči
                </div>
                {topPlayers.map((player, index) => (
                    <div
                        key={index}
                        className="flex justify-between py-3 border-b border-blue-100 last:border-b-0 text-blue-700"
                    >
                        <span>
                            {index + 1}. {player.name}
                        </span>
                        <span className="font-bold text-blue-900">{player.points}</span>
                    </div>
                ))}
                <button className="w-full px-4 py-2 bg-blue-600 text-white font-semibold cursor-pointer mt-3 hover:bg-blue-700 rounded-lg transition-colors">
                    Rebríček
                </button>
            </div>

            {/* Quick Actions Box */}
            <div className="border border-blue-200 p-5 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md">
                <div className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-200 text-blue-900">
                    ⚡ Rýchle akcie
                </div>
                <button className="w-full px-4 py-2 border-2 border-blue-600 bg-white text-blue-600 font-semibold cursor-pointer mb-3 hover:bg-blue-50 rounded-lg transition-colors">
                    + Vytvoriť turnaj
                </button>
                <button className="w-full px-4 py-2 border-2 border-blue-600 bg-white text-blue-600 font-semibold cursor-pointer mb-3 hover:bg-blue-50 rounded-lg transition-colors">
                    + Vytvoriť tím
                </button>
                <button className="w-full px-4 py-2 border-2 border-blue-600 bg-white text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                    🔍 Hľadať hráčov
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
