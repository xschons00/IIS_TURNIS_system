import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

function TournamentDetailPage() {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [userTeams, setUserTeams] = useState([]);
    const [showTeamPopup, setShowTeamPopup] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [teamLoadError, setTeamLoadError] = useState('');
    const [participantsError, setParticipantsError] = useState('');
    const [contact, setContact] = useState({ name: null, email: null });
    const [matches, setMatches] = useState([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [matchesError, setMatchesError] = useState(null);
    const [isEventLeader, setIsEventLeader] = useState(false);
    const [decisionLoading, setDecisionLoading] = useState(null);
    const [matchActionLoading, setMatchActionLoading] = useState(null);
    const [startLoading, setStartLoading] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [advanceSelection, setAdvanceSelection] = useState(null);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                setLoading(true);
                const response = await apiFetch(`/api/events/${id}`);
                if (!response.ok) {
                    throw new Error('Turnaj nenájdený');
                }
                const { data } = await parseApiJson(response);
                setTournament(data || null);
                const loggedInUser = JSON.parse(localStorage.getItem('logged_in_user') || '{}');
                const leaderCheck = loggedInUser.user_ID && (loggedInUser.user_ID === data?.event_leader_id || loggedInUser.role === 'ADMIN');
                setIsEventLeader(Boolean(leaderCheck));
                setCurrentUser(loggedInUser?.user_ID ? loggedInUser : null);
                // Load contact (creator) info
                if (data?.event_leader_id) {
                    try {
                        const leaderResponse = await apiFetch(`/api/players/${data.event_leader_id}`);
                        if (leaderResponse.ok) {
                            const { data: leaderData } = await parseApiJson(leaderResponse);
                            setContact({
                                name: leaderData?.user_name || null,
                                email: leaderData?.email || null,
                            });
                        }
                    } catch (leaderErr) {
                        console.error('Error fetching event leader contact:', leaderErr);
                    }
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching tournament:', err);
                setError(err.message);
                setIsEventLeader(false);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id]);

    const refreshParticipants = async () => {
        if (!tournament) return;

        try {
            const response = await apiFetch(`/api/events/${id}/participants`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Nepodarilo sa načítať účastníkov');
            }
            const { data } = await parseApiJson(response);
            let participantsList = [];

            if (data) {
                if (Array.isArray(data.participants)) {
                    participantsList = data.participants;
                } else if (Array.isArray(data)) {
                    participantsList = data;
                }
            }

            // For team tournaments, fetch member count for each team
            if (tournament.event_type === 'TEAM' && participantsList.length > 0) {
                participantsList = await Promise.all(
                    participantsList.map(async (participant) => {
                        try {
                            const countResponse = await apiFetch(`/api/teams/${participant.team_ID}/members/count`);
                            if (countResponse.ok) {
                                const { data: countData } = await parseApiJson(countResponse);
                                return {
                                    ...participant,
                                    member_count: (countData?.members ?? 0)
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching member count for team ${participant.team_ID}:`, err);
                        }
                        return {
                            ...participant,
                            member_count: 0
                        };
                    })
                );
            }

            setParticipants(participantsList);
            setParticipantsError('');
        } catch (err) {
            console.error('Error fetching participants:', err);
            setParticipantsError('Nepodarilo sa načítať účastníkov turnaja.');
        }
    };

    useEffect(() => {
        const fetchUserTeams = async () => {
                if (!tournament || tournament.event_type !== 'TEAM') return;

                try {
                    const loggedInUser = JSON.parse(localStorage.getItem('logged_in_user') || '{}');
                    if (!loggedInUser.user_ID) return;

                const response = await apiFetch('/api/teams', { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('Nepodarilo sa načítať tímy');
                }
                const { data } = await parseApiJson(response);
                const teams = Array.isArray(data) ? data : [];
                const ownedTeams = teams.filter((team) => team.team_leader_id === loggedInUser.user_ID);
                setUserTeams(ownedTeams);
                setTeamLoadError(ownedTeams.length === 0 ? 'Nemáte žiadne tímy, ktoré by sa dali prihlásiť.' : '');
            } catch (err) {
                console.error('Error fetching user teams:', err);
                setTeamLoadError('Nepodarilo sa načítať tímy priradené k vášmu účtu.');
            }
        };

        refreshParticipants();
        fetchUserTeams();
    }, [tournament, id]);

    const refreshMatches = async () => {
        if (!tournament) return;
        setMatchesLoading(true);
        setMatchesError(null);
        setMatches([]);
        try {
            const response = await apiFetch(`/api/events/${id}/matches`);
            if (!response.ok) {
                throw new Error('Nepodarilo sa načítať zápasy turnaja');
            }
            const { data } = await parseApiJson(response);
            const matchesData = Array.isArray(data?.matches) ? data.matches : [];
            setMatches(matchesData);
        } catch (err) {
            console.error('Error fetching matches:', err);
            setMatchesError(err.message);
        } finally {
            setMatchesLoading(false);
        }
    };

    useEffect(() => {
        refreshMatches();
    }, [tournament, id]);

    const participantStatus = (participant) => participant?.status || participant?.pivot?.status || 'ACCEPTED';
    const acceptedParticipants = participants.filter((participant) => participantStatus(participant) === 'ACCEPTED');
    const pendingParticipants = participants.filter((participant) => participantStatus(participant) === 'REQUESTED');
    const participantsCount = acceptedParticipants.length;
    const loggedUserId = currentUser?.user_ID;
    const userRegistered = tournament?.event_type === 'SOLO'
        ? participants.some((p) => p.user_ID === loggedUserId)
        : false;
    const teamRegistered = tournament?.event_type === 'TEAM'
        ? participants.some((p) => userTeams.some((t) => t.team_ID === p.team_ID))
        : false;
    const isRegistered = Boolean(userRegistered || teamRegistered);
    const allowedBracketSizes = [2, 4, 8, 16, 32];
    const canStartTournament =
        isEventLeader &&
        tournament?.event_state === 'REGISTRATION' &&
        allowedBracketSizes.includes(participantsCount) &&
        participantsCount === Number(tournament?.max_participants || 0);
    const canLeaveRegistration = isRegistered && tournament?.event_state === 'REGISTRATION';

    const participantName = (participantId) => {
        if (!participantId) return 'TBD';
        const list = Array.isArray(participants) ? participants : [];
        if (tournament?.event_type === 'TEAM') {
            return list.find((p) => p.team_ID === participantId)?.team_name || 'Tím TBD';
        }
        const player = list.find((p) => p.user_ID === participantId);
        if (!player) return 'Hráč TBD';
        return `${player.first_name || ''} ${player.last_name || ''}`.trim() || player.user_name || 'Hráč TBD';
    };

    const rounds = (() => {
        const maxParticipants = Number(tournament?.max_participants) || 0;
        const maxRoundFromMatches = matches.reduce((max, m) => Math.max(max, m.round || 0), 0);
        const totalRounds = maxParticipants > 1 ? Math.max(Math.log2(maxParticipants), maxRoundFromMatches) : maxRoundFromMatches;
        const roundsCount = Number.isFinite(totalRounds) && totalRounds > 0 ? Math.ceil(totalRounds) : 0;
        const byRound = matches.reduce((acc, match) => {
            const r = match.round || 1;
            acc[r] = acc[r] || [];
            acc[r].push(match);
            return acc;
        }, {});

        const roundsArray = [];
        for (let r = 1; r <= roundsCount; r++) {
            const expectedMatches = Math.max(1, Math.ceil((maxParticipants || 2) / (2 ** r)));
            const list = (byRound[r] || []).slice(0, expectedMatches);
            while (list.length < expectedMatches) {
                list.push({
                    participant_A: null,
                    participant_B: null,
                    participant_A_points: null,
                    participant_B_points: null,
                    winner: null,
                    round: r,
                });
            }
            roundsArray.push({ round: r, matches: list });
        }

        return roundsArray;
    })();
    const maxMatchesPerRound = rounds.reduce((max, r) => Math.max(max, r.matches.length), 0);

    const handleRegistration = async () => {
        if (!tournament) return;

        const loggedInUser = currentUser || JSON.parse(localStorage.getItem('logged_in_user') || '{}');
        if (!loggedInUser.user_ID) {
            alert('Musíte byť prihlásený, aby ste sa mohli zaregistrovať na turnaj');
            return;
        }

        if (tournament.event_type === 'SOLO') {
            // Register immediately for solo tournament
            try {
                setRegistering(true);
                const response = await apiFetch(`/api/events/${id}/participants`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.status === 401) {
                    throw new Error('Musíte byť prihlásený, aby ste sa mohli registrovať.');
                }

                if (!response.ok) {
                    const { message } = await parseApiJson(response);
                    throw new Error(message || 'Registrácia zlyhala');
                }

                alert('Žiadosť o účasť bola odoslaná. Počkajte na schválenie vedúceho turnaja.');
                window.location.reload();
            } catch (err) {
                console.error('Registration error:', err);
                alert(err.message || 'Registrácia zlyhala');
            } finally {
                setRegistering(false);
            }
        } else {
            // Show team selection popup for team tournament
            setShowTeamPopup(true);
        }
    };

    const handleTeamRegistration = async (teamId) => {
        try {
            setRegistering(true);
            const response = await apiFetch(`/api/events/${id}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ team_id: teamId }),
            });

            if (response.status === 401) {
                throw new Error('Musíte byť prihlásený ako líder tímu, aby ste registrovali tím.');
            }

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Registrácia tímu zlyhala');
            }

            alert('Žiadosť o registráciu tímu bola odoslaná. Počkajte na schválenie vedúceho turnaja.');
            setShowTeamPopup(false);
            window.location.reload();
        } catch (err) {
            console.error('Registration error:', err);
            alert(err.message || 'Registrácia zlyhala');
        } finally {
            setRegistering(false);
        }
    };

    const handleLeaveRegistration = async () => {
        if (!tournament) return;
        try {
            setLeaveLoading(true);
            const response = await apiFetch(`/api/events/${id}/participants`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Nepodarilo sa odhlásiť');
            }

            alert('Úspešne ste sa odhlásili z turnaja');
            await refreshParticipants();
            await refreshMatches();
        } catch (err) {
            console.error('Leave registration error:', err);
            alert(err.message || 'Odhlásenie zlyhalo');
        } finally {
            setLeaveLoading(false);
        }
    };

    const handleParticipantDecision = async (participantId, action) => {
        if (!tournament) return;

        const isApprove = action === 'approve';
        const url = isApprove
            ? `/api/events/${id}/participants/${participantId}/approve`
            : `/api/events/${id}/participants/${participantId}`;

        try {
            setDecisionLoading(`${action}-${participantId}`);
            const response = await apiFetch(url, {
                method: isApprove ? 'PUT' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Akcia zlyhala');
            }

            await refreshParticipants();
        } catch (err) {
            console.error('Participant decision error:', err);
            alert(err.message || 'Akcia zlyhala');
        } finally {
            setDecisionLoading(null);
        }
    };

    const handleSetWinner = async (matchId, participantId) => {
        if (!isEventLeader || !matchId || !participantId) return;
        try {
            setMatchActionLoading(`${matchId}-${participantId}`);
            const response = await apiFetch(`/api/matches/${matchId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ winner: participantId }),
            });

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Nepodarilo sa uložiť víťaza');
            }

            await refreshMatches();
        } catch (err) {
            console.error('Set winner error:', err);
            alert(err.message || 'Nepodarilo sa uložiť víťaza');
        } finally {
            setMatchActionLoading(null);
            setAdvanceSelection(null);
        }
    };

    const handleSelectForAdvance = (matchId, participantId) => {
        if (!isEventLeader || !participantId) return;
        const selectedKey = `${matchId}-${participantId}`;
        if (advanceSelection?.key === selectedKey) {
            setAdvanceSelection(null);
        } else {
            setAdvanceSelection({ matchId, participantId, key: selectedKey });
        }
    };

    const handleStartTournament = async () => {
        if (!tournament) return;
        try {
            setStartLoading(true);
            const response = await apiFetch(`/api/events/${id}/start`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Nepodarilo sa spustiť turnaj');
            }

            alert('Turnaj bol spustený!');
            window.location.reload();
        } catch (err) {
            console.error('Start tournament error:', err);
            alert(err.message || 'Nepodarilo sa spustiť turnaj');
        } finally {
            setStartLoading(false);
        }
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    };

    const formatDateTime = (isoDate, time) => {
        if (!isoDate) return 'N/A';
        const dateStr = formatDate(isoDate);
        if (time) {
            return `${dateStr} ${time}`;
        }
        return dateStr;
    };

    const getStatusText = (status) => {
        const statusMap = {
            'NEW': 'NOVÝ',
            'REGISTRATION': 'REGISTRÁCIA',
            'ONGOING': 'PREBIEHA',
            'FINISHED': 'UKONČENÝ'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'NEW': 'bg-yellow-50 border-yellow-600 text-yellow-900',
            'REGISTRATION': 'bg-green-50 border-green-600 text-green-900',
            'ONGOING': 'bg-blue-50 border-blue-600 text-blue-900',
            'FINISHED': 'bg-gray-50 border-gray-600 text-gray-900'
        };
        return colorMap[status] || 'bg-white border-blue-600 text-blue-900';
    };

    const getUserInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : '?';
    };

    const getTeamInitials = (teamName) => {
        return teamName ? teamName.substring(0, 2).toUpperCase() : '??';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Turnaje" />
                    <div className="text-center py-20">
                        <div className="animate-pulse text-blue-600 text-xl">Načítavam turnaj...</div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Turnaje" />
                    <div className="max-w-2xl mx-auto py-20">
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                            <div className="text-red-600 text-2xl font-semibold mb-3">⚠️ Chyba</div>
                            <div className="text-red-500 mb-4">{error || 'Turnaj nenájdený'}</div>
                            <button
                                onClick={() => window.location.href = appUrl('/tournaments')}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Späť na zoznam turnajov
                            </button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Turnaje" />

                {/* Breadcrumb */}
                <div className="px-6 py-3 bg-gradient-to-br from-gray-50 to-blue-50 border-b border-blue-200">
                    <div className="text-blue-600 text-sm">
                        <a href={appUrl('/')} className="hover:text-blue-800">Domov</a>
                        {' > '}
                        <a href={appUrl('/tournaments')} className="hover:text-blue-800">Turnaje</a>
                        {' > '}
                        <span className="text-blue-900 font-semibold">{tournament.event_name}</span>
                    </div>
                </div>

                {/* Tournament Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-6 border-b-2 border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-blue-900 mb-2">{tournament.event_name}</h1>
                        </div>
                        <div className="text-center">
                            <div className={`px-6 py-2 border-2 rounded-lg font-bold mb-3 ${getStatusColor(tournament.event_state)}`}>
                                {getStatusText(tournament.event_state)}
                            </div>
                            {tournament.event_state === 'REGISTRATION' && !isRegistered && (
                                <button
                                    onClick={handleRegistration}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all shadow-md whitespace-nowrap"
                                >
                                    ✓ Registrovať sa na turnaj
                                </button>
                            )}
                            {canLeaveRegistration && (
                                <div className="mt-3">
                                    <button
                                        onClick={handleLeaveRegistration}
                                        disabled={leaveLoading}
                                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-md whitespace-nowrap disabled:opacity-50"
                                    >
                                        {leaveLoading ? 'Odhlašujem...' : 'Odhlásiť sa'}
                                    </button>
                                </div>
                            )}
                            {isEventLeader && tournament.event_state === 'REGISTRATION' && (
                                <div className="mt-3">
                                    <button
                                        onClick={handleStartTournament}
                                        disabled={!canStartTournament || startLoading}
                                        className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all whitespace-nowrap ${
                                            canStartTournament
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        }`}
                                    >
                                        {startLoading ? 'Spúšťam...' : 'Spustiť turnaj'}
                                    </button>
                                    {!canStartTournament && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            Turnaj je možné spustiť až po naplnení kapacity ({participantsCount}/{tournament.max_participants})
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-4xl">
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">Koniec turnaja:</span>
                            <span className="font-bold text-blue-900">
                                {formatDate(tournament.event_end_date || tournament.event_date)}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">Začiatok turnaja:</span>
                            <span className="font-bold text-blue-900">{formatDateTime(tournament.event_date, tournament.start_time)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">Kontakt:</span>
                            <span className="font-bold text-blue-900">
                                {contact.email || tournament.contact_email || 'Neuvedené'}
                                {contact.name ? ` (${contact.name})` : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Description Section */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                📝 Popis turnaja
                            </h2>
                            <div className="text-gray-700 leading-relaxed">
                                {tournament.description || 'Popis turnaja nie je k dispozícii.'}
                            </div>
                        </div>

                        {/* Basic Info Section */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 lg:col-span-2">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                ℹ️ Základné informácie
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">📅 Dátum</span>
                                    <span className="font-bold text-blue-900">{formatDate(tournament.event_date)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">👥 Typ</span>
                                    <span className="font-bold text-blue-900">{tournament.event_type === 'SOLO' ? 'Jednotlivci' : 'Tímy'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">🎯 Kapacita</span>
                                    <div className="flex items-center gap-2 font-bold text-blue-900">
                                        <span>{participantsCount}/{tournament.max_participants} obsadených</span>
                                        {isEventLeader && pendingParticipants.length > 0 && (
                                            <span className="text-sm text-yellow-700 font-semibold">
                                                +{pendingParticipants.length} čaká na schválenie
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">⚙️ Systém</span>
                                    <span className="font-bold text-blue-900">Vyraďovací (Pavúk)</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">📍 Miesto</span>
                                    <span className="font-bold text-blue-900">{tournament.location || 'Neuvedené'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">💰 Vstupné</span>
                                    <span className="font-bold text-blue-900">{tournament.entry_fee || 'Zadarmo'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">🏆 Výherná cena</span>
                                    <span className="font-bold text-blue-900">{tournament.prize || 'Neuvedené'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bracket */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-blue-900">🎯 Pavúk turnaja</h3>
                            {matchesLoading && <span className="text-blue-600 text-sm">Načítavam zápasy...</span>}
                        </div>
                        {matchesError ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700 text-sm">
                                {matchesError}
                            </div>
                        ) : rounds.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">Zápasy zatiaľ nie sú k dispozícii.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div className="flex gap-10 justify-center items-start min-w-full">
                                    {rounds.map((round) => (
                                        <div
                                            key={round.round}
                                            className="flex flex-col gap-6 items-stretch min-w-[220px] max-w-[240px]"
                                            style={{ minHeight: `${maxMatchesPerRound * 110}px` }}
                                        >
                                            <div className="text-left font-bold text-blue-900 mb-2 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                                {round.round === rounds.length
                                                    ? 'Finále'
                                                    : round.round === rounds.length - 1
                                                    ? 'Semifinále'
                                                    : `Kolo ${round.round}`}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center gap-4">
                                                {round.matches.map((match, idx) => {
                                                    const matchId = match.id || match.match_ID;
                                                    const isAWinner = match.winner && match.winner === match.participant_A;
                                                    const isBWinner = match.winner && match.winner === match.participant_B;
                                                    const canSetWinner = isEventLeader && tournament?.event_state !== 'FINISHED' && !match.winner;
                                                    const isSelectedA = advanceSelection?.matchId === matchId && advanceSelection?.participantId === match.participant_A;
                                                    const isSelectedB = advanceSelection?.matchId === matchId && advanceSelection?.participantId === match.participant_B;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="border-2 border-blue-200 rounded-lg overflow-hidden bg-white shadow-md min-h-[90px] flex flex-col justify-between"
                                                        >
                                                            <div
                                                                className={`flex justify-between items-center px-3 py-2 border-b border-blue-100 ${isAWinner ? 'bg-green-50 font-semibold text-green-800' : ''} ${isSelectedA ? 'ring-2 ring-blue-500' : ''}`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                                                    disabled={!canSetWinner || !match.participant_A || matchesLoading}
                                                                    onClick={() => handleSelectForAdvance(matchId, match.participant_A)}
                                                                >
                                                                    <span className="truncate mr-1">{participantName(match.participant_A)}</span>
                                                                </button>
                                                                {canSetWinner && match.participant_A && isSelectedA && (
                                                                    <button
                                                                        onClick={() => handleSetWinner(matchId, match.participant_A)}
                                                                        className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                                                        disabled={matchActionLoading !== null || matchesLoading}
                                                                    >
                                                                        {matchActionLoading === `${matchId}-${match.participant_A}` ? 'Ukladám...' : 'Posunúť'}
                                                                    </button>
                                                                )}
                                                                <span className="font-bold text-blue-900">
                                                                    {match.participant_A_points ?? '-'}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className={`flex justify-between items-center px-3 py-2 ${isBWinner ? 'bg-green-50 font-semibold text-green-800' : ''} ${isSelectedB ? 'ring-2 ring-blue-500' : ''}`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                                                    disabled={!canSetWinner || !match.participant_B || matchesLoading}
                                                                    onClick={() => handleSelectForAdvance(matchId, match.participant_B)}
                                                                >
                                                                    <span className="truncate mr-1">{participantName(match.participant_B)}</span>
                                                                </button>
                                                                {canSetWinner && match.participant_B && isSelectedB && (
                                                                    <button
                                                                        onClick={() => handleSetWinner(matchId, match.participant_B)}
                                                                        className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                                                        disabled={matchActionLoading !== null || matchesLoading}
                                                                    >
                                                                        {matchActionLoading === `${matchId}-${match.participant_B}` ? 'Ukladám...' : 'Posunúť'}
                                                                    </button>
                                                                )}
                                                                <span className="font-bold text-blue-900">
                                                                    {match.participant_B_points ?? '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Participants Section */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                            👥 {tournament.event_type === 'SOLO' ? 'Prihlásení účastníci' : 'Prihlásené tímy'} ({participantsCount}/{tournament.max_participants})
                        </h2>
                        {participantsError ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center text-red-700">
                                {participantsError}
                            </div>
                        ) : (
                            <>
                                {acceptedParticipants.length === 0 ? (
                                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center">
                                        <div className="text-gray-500 text-lg">
                                            Zatiaľ nie sú schválení žiadni {tournament.event_type === 'SOLO' ? 'účastníci' : 'tímy'}
                                        </div>
                                    </div>
                                ) : tournament.event_type === 'SOLO' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {acceptedParticipants.map((participant, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                                                onClick={() => window.location.href = appUrl(`/players/${participant.user_ID}`)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Player Avatar */}
                                                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {getUserInitial(participant.user_name)}
                                                    </div>

                                                    {/* Player Details */}
                                                    <div className="flex-1">
                                                        <div className="font-bold text-blue-900 text-xl">
                                                            {participant.user_name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {participant.first_name} {participant.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {acceptedParticipants.map((participant, index) => (
                                            <div
                                                key={index}
                                                className="border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                                                onClick={() => window.location.href = appUrl(`/teams/${participant.team_ID}`)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Team Logo */}
                                                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {getTeamInitials(participant.team_name)}
                                                    </div>

                                                    {/* Team Details */}
                                                    <div className="flex-1">
                                                        <div className="font-bold text-blue-900 text-xl">
                                                            {participant.team_name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {participant.member_count || 0} členov
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Footer />
            </div>

            {/* Team Selection Popup */}
            {showTeamPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-b-2 border-blue-200">
                            <h2 className="text-2xl font-bold text-blue-900">Vyberte tím</h2>
                            <p className="text-blue-700 mt-2">Zvoľte tím, s ktorým sa chcete zaregistrovať na turnaj</p>
                        </div>

                        <div className="p-6">
                            {teamLoadError && (
                                <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
                                    {teamLoadError}
                                </div>
                            )}
                            {userTeams.length === 0 ? (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                                    <div className="text-yellow-700 text-lg mb-4">
                                        Nemáte žiadny tím, ktorý by sa dal prihlásiť
                                    </div>
                                    <a
                                        href={appUrl('/teams/create')}
                                        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Vytvoriť tím
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {userTeams.map((team) => (
                                        <div
                                            key={team.team_ID}
                                            className="border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                                            onClick={() => handleTeamRegistration(team.team_ID)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-blue-900 text-lg">{team.team_name}</div>
                                                    <div className="text-sm text-blue-600 mt-1">
                                                        {team.member_count || 0} členov
                                                    </div>
                                                </div>
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                                    disabled={registering}
                                                >
                                                    {registering ? 'Registrujem...' : 'Vybrať'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowTeamPopup(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                                disabled={registering}
                            >
                                Zrušiť
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TournamentDetailPage;
