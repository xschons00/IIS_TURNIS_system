import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';
import { parseApiJson } from '../utils/api';

function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('ALL');

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const response = await apiFetch('/api/players');

                if (!response.ok) {
                    throw new Error('Failed to fetch players');
                }

                const { data } = await parseApiJson(response);
                const playersData = Array.isArray(data) ? data : [];
                // Transform backend data to match frontend expectations
                // Filter out admin users - only show regular users
                const transformedData = playersData
                    .filter((user) => user.role === 'USER')
                    .map((user) => ({
                        user_ID: user.user_ID,
                        user_name: user.user_name,
                        ranking: user.ranking || 0,
                        tournaments: 0, // TODO: backend tournaments count
                        wins: 0, // TODO: backend wins
                        registered: user.created_at ? formatDate(user.created_at) : 'N/A',
                        faculty: user.faculty || 'OTHER',
                    }))
                    .sort((a, b) => (b.ranking || 0) - (a.ranking || 0))
                    .map((user, index) => ({ ...user, rank: index + 1 }));
                setPlayers(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching players:', err);
                setError(err.message);
                setPlayers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    // Get player initial from username
    const getUserInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : '?';
    };

    // Format date from ISO to Slovak format
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}. ${month}. ${year}`;
    };

    const filteredPlayers = players.filter((player) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query
            ? true
            : `${player.user_name}`.toLowerCase().startsWith(query);
        const matchesFaculty =
            facultyFilter === 'ALL' ? true : (player.faculty || 'OTHER') === facultyFilter;
        return matchesSearch && matchesFaculty;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Hráči" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-6 border-b border-blue-200">
                    <h1 className="text-4xl font-bold text-blue-900 mb-3">👤 Registrovaní hráči</h1>
                    <p className="text-blue-700 text-lg">
                        Prehľad všetkých registrovaných hráčov a ich umiestnenia v rebríčku.
                    </p>
                </div>

                {/* Main Content */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="🔍 Hľadať podľa používateľského mena"
                            className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none bg-white"
                        />
                        <select
                            value={facultyFilter}
                            onChange={(e) => setFacultyFilter(e.target.value)}
                            className="px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm bg-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="ALL">Všetky fakulty</option>
                            <option value="ENGINEERING">Strojárstvo</option>
                            <option value="CHEMISTRY">Chémia</option>
                            <option value="COMPUTER_SCIENCE">Informatika</option>
                            <option value="BUSINESS">Ekonomika</option>
                            <option value="ARTS">Umenie</option>
                            <option value="MATHEMATICS">Matematika</option>
                            <option value="PHYSICS">Fyzika</option>
                            <option value="OTHER">Iné/nezadané</option>
                        </select>
                    </div>
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-pulse text-blue-600 text-xl">Načítavam hráčov...</div>
                        </div>
                    ) : error ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                                <div className="text-red-600 text-2xl font-semibold mb-3">
                                    ⚠️ Načítanie dát zlyhalo
                                </div>
                                <div className="text-red-500 mb-4">
                                    Nepodarilo sa načítať hráčov z backendu.
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Skúsiť znova
                                </button>
                            </div>
                        </div>
                    ) : filteredPlayers.length === 0 ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                                <div className="text-blue-600 text-xl">
                                    👥 Žiadni hráči nenájdení
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 text-blue-700 font-semibold border-b-2 border-blue-200 pb-2"></div>

                            {/* Players Table */}
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-200">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                                            <th className="py-3 px-4 text-left font-bold" style={{width: '60px'}}>#</th>
                                            <th className="py-3 px-4 text-left font-bold">Používateľské meno</th>
                                            <th className="py-3 px-4 text-left font-bold" style={{width: '120px'}}>Body</th>
                                            <th className="py-3 px-4 text-left font-bold" style={{width: '120px'}}>Turnaje</th>
                                            <th className="py-3 px-4 text-left font-bold" style={{width: '120px'}}>Výhry</th>
                                            <th className="py-3 px-4 text-left font-bold" style={{width: '150px'}}>Registrovaný</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPlayers.map((player, index) => (
                                            <tr
                                                key={player.user_ID}
                                                onClick={() => {
                                                    window.location.href = appUrl(`/players/${player.user_ID}`);
                                                }}
                                                className={`border-b border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                }`}
                                            >
                                                <td className="py-3 px-4 text-blue-900 font-semibold">{player.rank}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                            {getUserInitial(player.user_name)}
                                                        </div>
                                                        <span className="font-bold text-blue-900 text-lg">
                                                            {player.user_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold border border-blue-300">
                                                        {player.ranking.toLocaleString()} b.
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                                        {player.tournaments}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                        {player.wins}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">
                                                    {player.registered}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default PlayersPage;
