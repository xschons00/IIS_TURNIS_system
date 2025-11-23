import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import TeamCard from './TeamCard';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const response = await apiFetch('/api/teams');

                if (!response.ok) {
                    throw new Error('Failed to fetch teams');
                }

                const { data } = await parseApiJson(response);
                const teamsData = Array.isArray(data) ? data : [];

                // Fetch member counts for each team
                const teamsWithCounts = await Promise.all(
                    teamsData.map(async (team) => {
                        try {
                            const countResponse = await apiFetch(`/api/teams/${team.team_ID}/members/count`);
                            if (countResponse.ok) {
                                const { data: countData } = await parseApiJson(countResponse);
                                return {
                                    team_ID: team.team_ID,
                                    team_name: team.team_name,
                                    ranking: team.ranking,
                                    members: (countData?.members ?? 0),
                                    tournaments: 0, // TODO: Get actual tournament count from backend
                                    wins: 0, // TODO: Calculate wins from team_participants
                                    points: team.ranking || 0 // Use ranking as points for now
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching count for team ${team.team_ID}:`, err);
                        }
                        // Fallback if count fetch fails
                        return {
                            team_ID: team.team_ID,
                            team_name: team.team_name,
                            ranking: team.ranking,
                            members: 0,
                            tournaments: 0,
                            wins: 0,
                            points: team.ranking || 0
                        };
                    })
                );

                setTeams(teamsWithCounts);
                setError(null);
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError(err.message);
                setTeams([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const filteredTeams = teams.filter((team) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (team.team_name || '').toLowerCase().startsWith(query);
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Tímy" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-6 border-b border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-blue-900 mb-3">👥 Všetky tímy</h1>
                            <p className="text-blue-700 text-lg">
                                Prehľad všetkých registrovaných tímov. Pripojte sa k tímu alebo vytvorte vlastný!
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const loggedInUser = localStorage.getItem('logged_in_user');
                                if (!loggedInUser) {
                                    alert('⚠️ Túto akciu môže vykonať len prihlásený používateľ.\n\nProsím, prihláste sa do svojho účtu.');
                                    return;
                                }
                                window.location.href = appUrl('/teams/create');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            + Vytvoriť tím
                        </button>
                    </div>
                </div>

                {/* Teams Grid */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="🔍 Hľadať tím podľa názvu"
                            className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none bg-white"
                        />
                    </div>
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-pulse text-blue-600 text-xl">Načítavam tímy...</div>
                        </div>
                    ) : error ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                                <div className="text-red-600 text-2xl font-semibold mb-3">
                                    ⚠️ Načítanie dát zlyhalo
                                </div>
                                <div className="text-red-500 mb-4">
                                    Nepodarilo sa načítať tímy z backendu.
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Skúsiť znova
                                </button>
                            </div>
                        </div>
                    ) : filteredTeams.length === 0 ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                                <div className="text-blue-600 text-xl">
                                    👥 Žiadne tímy nenájdené
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTeams.map((team) => (
                                    <TeamCard key={team.team_ID} team={team} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default TeamsPage;
