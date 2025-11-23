import React, { useState, useEffect } from 'react';
import TournamentCard from './TournamentCard';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

function TournamentList() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Map event_state from backend to Slovak display text
    const mapEventState = (state) => {
        const stateMap = {
            'NEW': 'NOVÝ',
            'REGISTRATION': 'REGISTRÁCIA',
            'ONGOING': 'PREBIEHAJÚCI',
            'FINISHED': 'DOKONČENÝ'
        };
        return stateMap[state] || state;
    };

    // Fetch tournaments from backend
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

                // Fetch participant counts for all tournaments in parallel
                const tournamentsWithCounts = await Promise.all(
                    events.map(async (event) => {
                        try {
                            const countResponse = await apiFetch(`/api/events/${event.event_ID}/participants/count`);
                            if (countResponse.ok) {
                                const { data: countData } = await parseApiJson(countResponse);
                                return {
                                    id: event.event_ID,
                                    title: event.event_name,
                                    date: event.event_date,
                                    type: event.event_type,
                                    maxParticipants: event.max_participants,
                                    registered: (countData?.participants ?? 0),
                                    status: mapEventState(event.event_state)
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching participant count for tournament ${event.event_ID}:`, err);
                        }
                        // Fallback if count fetch fails
                        return {
                            id: event.event_ID,
                            title: event.event_name,
                            date: event.event_date,
                            type: event.event_type,
                            maxParticipants: event.max_participants,
                            registered: 0,
                            status: mapEventState(event.event_state)
                        };
                    })
                );
                setTournaments(tournamentsWithCounts);
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

    return (
        <div className="border border-blue-200 p-6 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold mb-5 pb-3 border-b-2 border-blue-300 text-blue-900">
                📋 Aktuálne turnaje
            </div>

            {loading ? (
                <div className="text-center py-12 text-blue-600">
                    <div className="animate-pulse text-lg">Načítavam turnaje...</div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                        <div className="text-red-600 text-lg font-semibold mb-2">
                            ⚠️ Načítanie dát zlyhalo
                        </div>
                        <div className="text-red-500 text-sm">
                            Nepodarilo sa načítať turnaje z backendu.
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Skúsiť znova
                        </button>
                    </div>
                </div>
            ) : tournaments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                        <div className="text-blue-600 text-lg">
                            📋 Žiadne turnaje nenájdené
                        </div>
                    </div>
                </div>
            ) : (
                tournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                ))
            )}

            {!loading && !error && (
                <a href={appUrl('/tournaments')} className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-center cursor-pointer mt-3 hover:from-blue-700 hover:to-cyan-600 rounded-lg shadow-md transition-all">
                    Zobraziť všetky turnaje
                </a>
            )}
        </div>
    );
}

export default TournamentList;
