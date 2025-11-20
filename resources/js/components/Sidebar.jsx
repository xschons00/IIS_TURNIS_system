import React, { useState, useEffect } from 'react';

function Sidebar() {
    const [stats, setStats] = useState([]);
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch statistics and players from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch statistics
                const statsResponse = await fetch('http://localhost:8000/api/statistics');
                const playersResponse = await fetch('http://localhost:8000/api/players');

                if (!statsResponse.ok || !playersResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const statsData = await statsResponse.json();
                const playersData = await playersResponse.json();

                setStats(statsData);
                // Get top 3 players sorted by points
                setTopPlayers(playersData.slice(0, 3));
                setError(null);
            } catch (err) {
                console.error('Error fetching sidebar data:', err);
                setError(err.message);
                setStats([]);
                setTopPlayers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col gap-5">
            {/* Stats Box */}
            <div className="border border-blue-200 p-5 rounded-lg bg-white shadow-md">
                <div className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-200 text-blue-900">
                    📊 Štatistiky
                </div>
                {loading ? (
                    <div className="text-center py-6 text-blue-600">
                        <div className="animate-pulse text-sm">Načítavam štatistiky...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="text-red-600 text-sm font-semibold mb-1">
                            ⚠️ Načítanie dát zlyhalo
                        </div>
                        <div className="text-red-500 text-xs">
                            Nepodarilo sa načítať štatistiky z backendu.
                        </div>
                    </div>
                ) : stats.length === 0 ? (
                    <div className="text-center py-6 text-blue-600 text-sm">
                        📊 Žiadne štatistiky nenájdené
                    </div>
                ) : (
                    stats.map((stat, index) => (
                        <div
                            key={index}
                            className="flex justify-between py-3 border-b border-blue-100 last:border-b-0 text-blue-700"
                        >
                            <span>{stat.label}</span>
                            <span className="font-bold text-blue-900">{stat.value}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Top Players Box */}
            <div className="border border-blue-200 p-5 rounded-lg bg-white shadow-md">
                <div className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-200 text-blue-900">
                    🏅 Top hráči
                </div>
                {loading ? (
                    <div className="text-center py-6 text-blue-600">
                        <div className="animate-pulse text-sm">Načítavam hráčov...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="text-red-600 text-sm font-semibold mb-1">
                            ⚠️ Načítanie dát zlyhalo
                        </div>
                        <div className="text-red-500 text-xs">
                            Nepodarilo sa načítať hráčov z backendu.
                        </div>
                    </div>
                ) : topPlayers.length === 0 ? (
                    <div className="text-center py-6 text-blue-600 text-sm">
                        👥 Žiadni hráči nenájdení
                    </div>
                ) : (
                    <>
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
                    </>
                )}
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
