import React, { useState, useEffect } from 'react';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

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

                // Fetch statistics and players
                const statsResponse = await apiFetch('/api/statistics');
                const playersResponse = await apiFetch('/api/players');

                if (!playersResponse.ok) {
                    throw new Error('Failed to fetch players data');
                }

                // Handle statistics
                let statsData = null;
                if (statsResponse.ok) {
                    const { data } = await parseApiJson(statsResponse);
                    statsData = data || null;
                }

                const { data: playersData } = await parseApiJson(playersResponse);
                const playersList = Array.isArray(playersData) ? playersData : [];

                // Transform statistics data from backend object to array for display
                if (statsData) {
                    const transformedStats = [
                        { label: 'Aktívne turnaje', value: statsData.active_events || 0 },
                        { label: 'Registrovaní užívatelia', value: statsData.registered_users || 0 },
                        { label: 'Tímy', value: statsData.teams || 0 },
                        { label: 'Dokončené zápasy', value: statsData.matches || 0 }
                    ];
                    setStats(transformedStats);
                } else {
                    setStats([]);
                }

                // Transform players data to match frontend expectations
                const transformedPlayers = playersList.map(user => ({
                    name: user.user_name,
                    points: user.ranking || 0
                }));

                // Sort by points and get top 3
                const sortedPlayers = transformedPlayers.sort((a, b) => b.points - a.points);
                setTopPlayers(sortedPlayers.slice(0, 3));
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
                        <a href={appUrl('/players')} className="block w-full px-4 py-2 bg-blue-600 text-white font-semibold text-center cursor-pointer mt-3 hover:bg-blue-700 rounded-lg transition-colors">
                            Rebríček
                        </a>
                    </>
                )}
            </div>

            {/* Quick Actions Box */}
            <div className="border border-blue-200 p-5 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md">
                <div className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-200 text-blue-900">
                    ⚡ Rýchle akcie
                </div>
                <button
                    onClick={() => {
                        const loggedInUser = localStorage.getItem('logged_in_user');
                        if (!loggedInUser) {
                            alert('⚠️ Túto akciu môže vykonať len prihlásený používateľ.\n\nProsím, prihláste sa do svojho účtu.');
                            return;
                        }
                        window.location.href = appUrl('/tournaments/create');
                    }}
                    className="block w-full px-4 py-2 border-2 border-blue-600 bg-white text-blue-600 font-semibold cursor-pointer mb-3 hover:bg-blue-50 rounded-lg transition-colors text-center"
                >
                    + Vytvoriť turnaj
                </button>
                <button
                    onClick={() => {
                        const loggedInUser = localStorage.getItem('logged_in_user');
                        if (!loggedInUser) {
                            alert('⚠️ Túto akciu môže vykonať len prihlásený používateľ.\n\nProsím, prihláste sa do svojho účtu.');
                            return;
                        }
                        window.location.href = appUrl('/teams/create');
                    }}
                    className="block w-full px-4 py-2 border-2 border-blue-600 bg-white text-blue-600 font-semibold cursor-pointer mb-3 hover:bg-blue-50 rounded-lg transition-colors text-center"
                >
                    + Vytvoriť tím
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
