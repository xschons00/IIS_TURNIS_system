import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import TournamentCard from './TournamentCard';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, registration, ongoing, finished
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                setLoading(true);
                const response = await apiFetch('/api/events');

                if (!response.ok) {
                    throw new Error('Failed to fetch tournaments');
                }

                const { data } = await parseApiJson(response);
                const events = Array.isArray(data) ? data : [];

                const mapEventState = (state) => {
                    const stateMap = {
                        'NEW': 'NOVÝ',
                        'REGISTRATION': 'REGISTRÁCIA',
                        'ONGOING': 'PREBIEHA',
                        'FINISHED': 'UKONČENÝ'
                    };
                    return stateMap[state] || state;
                };

                // Filter to only approved/active (not NEW)
                const approved = events.filter((event) => event.event_state && event.event_state !== 'NEW');

                const transformedData = await Promise.all(
                    approved.map(async (event) => {
                        try {
                            const countResponse = await apiFetch(`/api/events/${event.event_ID}/participants/count`, {
                                credentials: 'include',
                            });
                            if (countResponse.ok) {
                                const { data: countData } = await parseApiJson(countResponse);
                                return {
                                    id: event.event_ID,
                                    title: event.event_name,
                                    date: event.event_date,
                                    type: event.event_type,
                                    maxParticipants: event.max_participants,
                                    registered: (countData?.participants ?? 0),
                                    status: mapEventState(event.event_state),
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching participant count for event ${event.event_ID}`, err);
                        }
                        return {
                            id: event.event_ID,
                            title: event.event_name,
                            date: event.event_date,
                            type: event.event_type,
                            maxParticipants: event.max_participants,
                            registered: 0,
                            status: mapEventState(event.event_state),
                        };
                    })
                );
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
        const matchesFilter =
            filter === 'all' ||
            (filter === 'registration' && tournament.status === 'REGISTRÁCIA') ||
            (filter === 'ongoing' && tournament.status === 'PREBIEHA') ||
            (filter === 'finished' && tournament.status === 'UKONČENÝ');

        const query = search.trim().toLowerCase();
        const title = (tournament.title || '').toLowerCase();
        const type = (tournament.type || '').toLowerCase();
        const matchesSearch = !query || title.startsWith(query) || type.startsWith(query);

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Turnaje" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-6 border-b border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-blue-900 mb-3">📋 Všetky turnaje</h1>
                            <p className="text-blue-700 text-lg">
                                Prehľad všetkých dostupných turnajov. Vyberte si turnaj a zaregistrujte sa!
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const loggedInUser = localStorage.getItem('logged_in_user');
                                if (!loggedInUser) {
                                    alert('⚠️ Túto akciu môže vykonať len prihlásený používateľ.\n\nProsím, prihláste sa do svojho účtu.');
                                    return;
                                }
                                window.location.href = appUrl('/create-tournament');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                        >
                            + Vytvoriť turnaj
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white border-b border-blue-200 px-6 py-4 space-y-3">
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
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="🔍 Hľadať podľa názvu alebo typu"
                            className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none bg-white"
                        />
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
