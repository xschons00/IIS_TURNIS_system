import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

const statusLabels = {
    NEW: 'Čaká na schválenie',
    REGISTRATION: 'Registrácia',
    ONGOING: 'Prebieha',
    FINISHED: 'Ukončené',
    REJECTED: 'Zamietnuté',
};

const badgeStyles = {
    NEW: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    REGISTRATION: 'bg-green-100 border-green-300 text-green-800',
    ONGOING: 'bg-blue-100 border-blue-300 text-blue-800',
    FINISHED: 'bg-gray-100 border-gray-300 text-gray-700',
    REJECTED: 'bg-red-100 border-red-200 text-red-700',
};

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

function AdminApproveTournamentsPage() {
    const [events, setEvents] = useState([]);
    const [playersById, setPlayersById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [actioning, setActioning] = useState({});

    // Filters
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [onlyWithSlots, setOnlyWithSlots] = useState(false);
    const [statusFilters, setStatusFilters] = useState({
        NEW: true,
        REGISTRATION: true,
        ONGOING: true,
        FINISHED: true,
    });

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('logged_in_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error('Error loading user', err);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');

                const [eventsRes, playersRes] = await Promise.all([
                    apiFetch('/api/events'),
                    apiFetch('/api/players'),
                ]);

                if (!eventsRes.ok) {
                    throw new Error('Nepodarilo sa načítať turnaje z API');
                }

                const { data: eventsPayload } = await parseApiJson(eventsRes);
                const eventsData = Array.isArray(eventsPayload) ? eventsPayload : [];

                let playersMap = {};
                if (playersRes.ok) {
                    const { data: players } = await parseApiJson(playersRes);
                    const playerList = Array.isArray(players) ? players : [];
                    playersMap = playerList.reduce((acc, player) => {
                        acc[player.user_ID] = `${player.first_name || ''} ${player.last_name || ''}`.trim() ||
                            player.user_name ||
                            player.email ||
                            `#${player.user_ID}`;
                        return acc;
                    }, {});
                }

                const eventsWithCounts = await Promise.all(
                    eventsData.map(async (event) => {
                        let registered = 0;
                        try {
                            const countRes = await apiFetch(`/api/events/${event.event_ID}/participants/count`);
                            if (countRes.ok) {
                                const { data: countData } = await parseApiJson(countRes);
                                registered = countData?.participants || 0;
                            }
                        } catch (err) {
                            console.error('Error fetching participant count', err);
                        }

                        return { ...event, registered };
                    })
                );

                setEvents(eventsWithCounts);
                setPlayersById(playersMap);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Nepodarilo sa načítať dáta');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const sortEvents = (list) => {
        const sorted = [...list];
        if (sortOption === 'newest') {
            sorted.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
        } else if (sortOption === 'oldest') {
            sorted.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        } else if (sortOption === 'upcoming') {
            sorted.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        } else if (sortOption === 'nameAZ') {
            sorted.sort((a, b) => (a.event_name || '').localeCompare(b.event_name || '', 'sk'));
        }
        return sorted;
    };

    const matchesFilters = (event) => {
        if (typeFilter !== 'ALL' && event.event_type !== typeFilter) {
            return false;
        }

        if (!statusFilters[event.event_state || 'NEW']) {
            return false;
        }

        if (dateFrom && new Date(event.event_date) < new Date(dateFrom)) {
            return false;
        }

        if (dateTo && new Date(event.event_date) > new Date(dateTo)) {
            return false;
        }

        if (onlyWithSlots && event.registered >= event.max_participants) {
            return false;
        }

        const query = searchTerm.trim().toLowerCase();
        if (query) {
            const organizer = playersById[event.event_leader_id] || '';
            const text = `${event.event_name} ${organizer} ${event.location || ''}`.toLowerCase();
            if (!text.includes(query)) {
                return false;
            }
        }

        return true;
    };

    const filteredPending = useMemo(
        () =>
            sortEvents(
                events.filter((event) => (event.event_state || 'NEW') === 'NEW' && matchesFilters(event))
            ),
        [events, typeFilter, dateFrom, dateTo, searchTerm, sortOption, onlyWithSlots, statusFilters, playersById]
    );

    const filteredProcessed = useMemo(
        () =>
            sortEvents(
                events.filter((event) => (event.event_state || 'NEW') !== 'NEW' && matchesFilters(event))
            ),
        [events, typeFilter, dateFrom, dateTo, searchTerm, sortOption, onlyWithSlots, statusFilters, playersById]
    );

    const resetFilters = () => {
        setTypeFilter('ALL');
        setDateFrom('');
        setDateTo('');
        setSearchTerm('');
        setSortOption('newest');
        setOnlyWithSlots(false);
        setStatusFilters({
            NEW: true,
            REGISTRATION: true,
            ONGOING: true,
            FINISHED: true,
        });
    };

    const handleApprove = async (eventId) => {
        setActionMessage('');
        setActionError('');
        setActioning((prev) => ({ ...prev, [eventId]: 'approve' }));
        try {
            const response = await apiFetch(`/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ event_state: 'REGISTRATION' }),
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('Na schválenie sa musíte prihlásiť ako admin.');
            }

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Schválenie zlyhalo');
            }

            const { data: updated } = await parseApiJson(response);
            const updatedEvent = updated || {};
            setEvents((prev) =>
                prev.map((ev) =>
                    ev.event_ID === eventId
                        ? { ...ev, ...updatedEvent, event_state: updatedEvent.event_state || 'REGISTRATION' }
                        : ev
                )
            );
            setActionMessage('Turnaj bol schválený a presunutý do registrácie.');
        } catch (err) {
            console.error(err);
            setActionError(err.message || 'Schválenie zlyhalo');
        } finally {
            setActioning((prev) => {
                const next = { ...prev };
                delete next[eventId];
                return next;
            });
        }
    };

    const handleReject = async (eventId) => {
        setActionMessage('');
        setActionError('');

        const confirmed = window.confirm('Naozaj chcete zamietnuť a odstrániť tento turnaj?');
        if (!confirmed) return;

        try {
            setActioning((prev) => ({ ...prev, [eventId]: 'reject' }));
            const response = await apiFetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('Na zamietnutie sa musíte prihlásiť ako admin.');
            }

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Zamietnutie zlyhalo');
            }

            setEvents((prev) => prev.filter((ev) => ev.event_ID !== eventId));
            setActionMessage('Turnaj bol zamietnutý a odstránený.');
        } catch (err) {
            console.error(err);
            setActionError(err.message || 'Zamietnutie zlyhalo');
        } finally {
            setActioning((prev) => {
                const next = { ...prev };
                delete next[eventId];
                return next;
            });
        }
    };

    const renderGuard = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Admin Panel" />
                <div className="p-10 text-center space-y-4">
                    <div className="text-3xl">🔒</div>
                    <div className="text-2xl font-bold text-blue-900">Táto sekcia je len pre administrátorov.</div>
                    <div className="text-blue-700">
                        Prihláste sa ako admin, aby ste mohli schvaľovať turnaje.
                    </div>
                    <a
                        href={appUrl('/login')}
                        className="inline-block px-5 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition-colors"
                    >
                        Prejsť na prihlásenie
                    </a>
                </div>
                <Footer />
            </div>
        </div>
    );

    const isAdmin = user?.role === 'ADMIN';

    if (!isAdmin) {
        return renderGuard();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Admin Panel" />

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 md:px-10 py-10 border-b border-blue-100">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm text-blue-700">
                            <span className="px-2 py-1 bg-blue-100 border border-blue-200 rounded-md">⚙️ Admin Panel</span>
                            <span className="text-blue-500">/</span>
                            <span>Schvaľovanie turnajov</span>
                        </div>
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Schvaľovanie turnajov</h1>
                                <p className="text-blue-800">
                                    Žiadosti z databázy sú zoradené podľa dátumu a stavu. Schváľte alebo zamietnite priamo z rozhrania.
                                </p>
                            </div>
                            <div className="px-4 py-2 bg-white border-2 border-blue-200 rounded-lg text-blue-800 shadow-sm">
                                <div className="text-xs uppercase text-blue-500 font-semibold">Administrátor</div>
                                <div className="font-bold">{user?.first_name} {user?.last_name}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-b border-blue-100 px-6 md:px-10 py-4">
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={appUrl('/admin/users')}
                            className="px-4 py-2 rounded-full border-2 border-blue-200 bg-white text-blue-800 font-semibold shadow-sm"
                        >
                            👥 Správa používateľov
                        </a>
                        <a
                            href={appUrl('/admin/approve-tournaments')}
                            className="px-4 py-2 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-md"
                        >
                            ✅ Schvaľovanie turnajov
                        </a>
                    </div>
                </div>

                {(actionMessage || actionError) && (
                    <div className="px-6 md:px-10 pt-6">
                        {actionMessage && (
                            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-800">
                                {actionMessage}
                            </div>
                        )}
                        {actionError && (
                            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                                {actionError}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[700px]">
                    <aside className="bg-gradient-to-b from-gray-50 to-blue-50 border-r border-blue-100 p-6">
                        <div className="space-y-6">
                            <div>
                                <div className="text-sm font-bold text-blue-900 mb-3 pb-2 border-b border-blue-200">Typ turnaja</div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="ALL"
                                            checked={typeFilter === 'ALL'}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span>Všetky</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="SOLO"
                                            checked={typeFilter === 'SOLO'}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span>Jednotlivci</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="TEAM"
                                            checked={typeFilter === 'TEAM'}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span>Tímy</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-bold text-blue-900 mb-3 pb-2 border-b border-blue-200">Stav</div>
                                <div className="space-y-2">
                                    {Object.keys(statusFilters).map((statusKey) => (
                                        <label key={statusKey} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={statusFilters[statusKey]}
                                                onChange={() =>
                                                    setStatusFilters((prev) => ({
                                                        ...prev,
                                                        [statusKey]: !prev[statusKey],
                                                    }))
                                                }
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span>{statusLabels[statusKey] || statusKey}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-bold text-blue-900 mb-3 pb-2 border-b border-blue-200">Dátum konania</div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-blue-600 mb-1">Od</div>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-blue-600 mb-1">Do</div>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onlyWithSlots}
                                        onChange={() => setOnlyWithSlots((prev) => !prev)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span>Len s voľnými miestami</span>
                                </label>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="w-full py-2.5 border-2 border-blue-200 text-blue-800 font-semibold rounded-lg bg-white hover:bg-blue-50 transition-colors"
                                >
                                    Zrušiť filtre
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="p-6 md:p-10 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row gap-3">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="🔍 Hľadať turnaje podľa názvu, organizátora alebo miesta"
                                    className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none bg-white"
                                />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm bg-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="newest">Zoradiť: Najneskoršie dátumy</option>
                                    <option value="oldest">Zoradiť: Najstaršie dátumy</option>
                                    <option value="upcoming">Zoradiť: Najbližšie dátumy</option>
                                    <option value="nameAZ">Zoradiť: Názov (A-Z)</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setActionMessage('Vyhľadávanie a zoradenie aktualizované.')}
                                    className="px-5 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition-colors"
                                >
                                    Hľadať
                                </button>
                            </div>
                            <div className="flex justify-between items-center border-b border-blue-200 pb-3">
                                <div className="text-blue-800">
                                    Načítané z DB: <span className="font-bold">{events.length}</span> turnajov
                                </div>
                                <div className="text-sm text-blue-600">
                                    Filtrované: {filteredPending.length + filteredProcessed.length} záznamov
                                </div>
                            </div>
                        </div>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⏳</span>
                                    <h2 className="text-2xl font-bold text-blue-900">Turnaje čakajúce na schválenie</h2>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-full text-sm font-semibold">
                                    {filteredPending.length} žiadosti
                                </span>
                            </div>

                            {loading ? (
                                <div className="bg-white border-2 border-blue-100 rounded-lg p-6 text-center text-blue-700">
                                    Načítavam turnaje z databázy...
                                </div>
                            ) : error ? (
                                <div className="bg-white border-2 border-red-200 rounded-lg p-6 text-center text-red-700">
                                    {error}
                                </div>
                            ) : filteredPending.length === 0 ? (
                                <div className="bg-white border-2 border-blue-100 rounded-lg p-6 text-center text-blue-700">
                                    Žiadne turnaje v stave „Čaká na schválenie“ podľa aktuálnych filtrov.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredPending.map((tournament) => (
                                        <div
                                            key={tournament.event_ID}
                                            className="bg-white border-2 border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-4">
                                                <div>
                                                    <div className="text-xs text-blue-500 font-semibold">ID: {tournament.event_ID}</div>
                                                    <div className="text-xl font-bold text-blue-900">{tournament.event_name}</div>
                                                    <div className="text-sm text-blue-700 flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
                                                            {tournament.event_type === 'TEAM' ? '👥 Tímy' : '👤 Jednotlivci'}
                                                        </span>
                                                        <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
                                                            Kapacita {tournament.registered}/{tournament.max_participants}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 border text-xs font-semibold rounded-full ${badgeStyles.NEW}`}>
                                                    {statusLabels.NEW}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 text-sm text-blue-800">
                                                <div className="flex items-center gap-2">
                                                    <span>👤</span>
                                                    <span>Organizátor:</span>
                                                    <span className="font-semibold">
                                                        {playersById[tournament.event_leader_id] || 'Neznámy'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>Dátum:</span>
                                                    <span className="font-semibold">{formatDate(tournament.event_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    <span>Miesto:</span>
                                                    <span className="font-semibold">{tournament.location || 'Neuvedené'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>🎯</span>
                                                    <span>Max. účastníci:</span>
                                                    <span className="font-semibold">{tournament.max_participants}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-blue-100">
                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(tournament.event_ID)}
                                                    className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-60"
                                                    disabled={!!actioning[tournament.event_ID]}
                                                >
                                                    {actioning[tournament.event_ID] === 'approve' ? '⟳ Spracovávam' : '✓ Schváliť'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReject(tournament.event_ID)}
                                                    className="flex-1 min-w-[120px] px-4 py-2 bg-red-100 text-red-700 font-semibold border border-red-200 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-60"
                                                    disabled={!!actioning[tournament.event_ID]}
                                                >
                                                    {actioning[tournament.event_ID] === 'reject' ? '⟳ Mazem' : '✗ Zamietnuť'}
                                                </button>
                                                <a
                                                    href={appUrl(`/tournaments/${tournament.event_ID}`)}
                                                    className="flex-1 min-w-[120px] px-4 py-2 bg-white text-blue-800 font-semibold border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
                                                >
                                                    👁️ Detail
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📋</span>
                                    <h2 className="text-2xl font-bold text-blue-900">Nedávno spracované</h2>
                                </div>
                                <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-full text-sm font-semibold">
                                    {filteredProcessed.length} záznamov
                                </span>
                            </div>

                            {loading ? (
                                <div className="bg-white border-2 border-blue-100 rounded-lg p-6 text-center text-blue-700">
                                    Načítavam turnaje z databázy...
                                </div>
                            ) : error ? (
                                <div className="bg-white border-2 border-red-200 rounded-lg p-6 text-center text-red-700">
                                    {error}
                                </div>
                            ) : filteredProcessed.length === 0 ? (
                                <div className="bg-white border-2 border-blue-100 rounded-lg p-6 text-center text-blue-700">
                                    Žiadne spracované turnaje podľa aktuálnych filtrov.
                                </div>
                            ) : (
                                <div className="overflow-x-auto bg-white border-2 border-blue-100 rounded-xl shadow-sm">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-blue-50 text-blue-900 text-sm">
                                            <tr>
                                                <th className="px-4 py-3 border-b border-blue-100">ID</th>
                                                <th className="px-4 py-3 border-b border-blue-100">Názov</th>
                                                <th className="px-4 py-3 border-b border-blue-100">Organizátor</th>
                                                <th className="px-4 py-3 border-b border-blue-100">Dátum</th>
                                                <th className="px-4 py-3 border-b border-blue-100">Kapacita</th>
                                                <th className="px-4 py-3 border-b border-blue-100">Štatút</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-blue-800">
                                            {filteredProcessed.map((tournament) => (
                                                <tr key={tournament.event_ID} className="border-b border-blue-50 last:border-0">
                                                    <td className="px-4 py-3 font-semibold text-blue-900">#{tournament.event_ID}</td>
                                                    <td className="px-4 py-3">{tournament.event_name}</td>
                                                    <td className="px-4 py-3">
                                                        {playersById[tournament.event_leader_id] || 'Neznámy'}
                                                    </td>
                                                    <td className="px-4 py-3">{formatDate(tournament.event_date)}</td>
                                                    <td className="px-4 py-3">
                                                        {tournament.registered}/{tournament.max_participants}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-3 py-1 text-sm font-semibold rounded-full border ${badgeStyles[tournament.event_state || 'REGISTRATION']}`}
                                                        >
                                                            {statusLabels[tournament.event_state] || tournament.event_state}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </main>
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default AdminApproveTournamentsPage;
