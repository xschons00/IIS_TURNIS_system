import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import TeamCard from './TeamCard';

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/teams');

                if (!response.ok) {
                    throw new Error('Failed to fetch teams');
                }

                const data = await response.json();
                // Transform backend data to match frontend expectations
                const transformedData = data.map(team => ({
                    team_ID: team.team_ID,
                    team_name: team.team_name,
                    ranking: team.ranking,
                    members: '0', // TODO: Get actual member count from backend (team.members relation)
                    tournaments: 0, // TODO: Get actual tournament count from backend (team.events relation)
                    wins: 0, // TODO: Calculate wins from team_participants.final_placement
                    points: 0 // TODO: Calculate points based on tournament placements
                }));
                setTeams(transformedData);
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
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
                            + Vytvoriť tím
                        </button>
                    </div>
                </div>

                {/* Teams Grid */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
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
                    ) : teams.length === 0 ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                                <div className="text-blue-600 text-xl">
                                    👥 Žiadne tímy nenájdené
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 text-blue-700 font-semibold">
                                Nájdených tímov: <span className="text-blue-900">{teams.length}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams.map((team) => (
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
