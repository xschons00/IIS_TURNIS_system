import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import TournamentCard from './TournamentCard';

function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, registration, ongoing, finished

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/tournaments');

                if (!response.ok) {
                    throw new Error('Failed to fetch tournaments');
                }

                const data = await response.json();
                const transformedData = data.map(event => ({
                    id: event.event_ID,
                    title: event.event_name,
                    date: event.event_date,
                    type: event.event_type,
                    maxParticipants: event.max_participants,
                    registered: 0,
                    status: 'REGISTRÁCIA'
                }));
                setTournaments(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching tournaments:', err);
                setError(err.message);
                setTournaments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    const filteredTournaments = tournaments.filter(tournament => {
        if (filter === 'all') return true;
        if (filter === 'registration') return tournament.status === 'REGISTRÁCIA';
        if (filter === 'ongoing') return tournament.status === 'PREBIEHA';
        if (filter === 'finished') return tournament.status === 'UKONČENÝ';
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Turnaje" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-6 border-b border-blue-200">
                    <h1 className="text-4xl font-bold text-blue-900 mb-3">📋 Všetky turnaje</h1>
                    <p className="text-blue-700 text-lg">
                        Prehľad všetkých dostupných turnajov. Vyberte si turnaj a zaregistrujte sa!
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white border-b border-blue-200 px-6 py-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Všetky ({tournaments.length})
                        </button>
                        <button
                            onClick={() => setFilter('registration')}
                            className={`px-6 py-2 font-semibold rounded-lg transition-colors border-2 ${
                                filter === 'registration'
                                    ? 'bg-green-600 text-white border-green-700'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Registrácia
                        </button>
                        <button
                            onClick={() => setFilter('ongoing')}
                            className={`px-6 py-2 font-semibold rounded-lg transition-colors border-2 ${
                                filter === 'ongoing'
                                    ? 'bg-blue-600 text-white border-blue-700'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Prebiehajú
                        </button>
                        <button
                            onClick={() => setFilter('finished')}
                            className={`px-6 py-2 font-semibold rounded-lg transition-colors border-2 ${
                                filter === 'finished'
                                    ? 'bg-gray-700 text-white border-gray-800'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            Ukončené
                        </button>
                    </div>
                </div>

                {/* Tournaments Grid */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-pulse text-blue-600 text-xl">Načítavam turnaje...</div>
                        </div>
                    ) : error ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                                <div className="text-red-600 text-2xl font-semibold mb-3">
                                    ⚠️ Načítanie dát zlyhalo
                                </div>
                                <div className="text-red-500 mb-4">
                                    Nepodarilo sa načítať turnaje z backendu.
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Skúsiť znova
                                </button>
                            </div>
                        </div>
                    ) : filteredTournaments.length === 0 ? (
                        <div className="max-w-2xl mx-auto py-20">
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                                <div className="text-blue-600 text-xl">
                                    📋 Žiadne turnaje v tejto kategórii
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTournaments.map((tournament) => (
                                <TournamentCard key={tournament.id} tournament={tournament} />
                            ))}
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default TournamentsPage;
