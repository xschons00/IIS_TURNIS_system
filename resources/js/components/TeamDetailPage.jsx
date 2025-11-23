import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

function TeamDetailPage() {
    const pathParts = window.location.pathname.split('/');
    const teamId = pathParts[pathParts.length - 1];

    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLeader, setIsLeader] = useState(false);
    const [canLeaveTeam, setCanLeaveTeam] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editMembers, setEditMembers] = useState([]);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [memberError, setMemberError] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [allPlayers, setAllPlayers] = useState([]);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [teamNameError, setTeamNameError] = useState(null);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);

                // Fetch team details
                const teamResponse = await apiFetch(`/api/teams/${teamId}`);
                if (!teamResponse.ok) {
                    throw new Error('Tím nenájdený');
                }
                const { data: teamData } = await parseApiJson(teamResponse);
                setTeam(teamData || null);

                // Fetch team members
                const membersResponse = await apiFetch(`/api/teams/${teamId}/members`);
                let normalizedMembers = [];
                if (membersResponse.ok) {
                    const { data: membersData } = await parseApiJson(membersResponse);
                    console.log('Members data received:', membersData);
                    // Handle both array and object response formats
                    if (Array.isArray(membersData?.members)) {
                        normalizedMembers = membersData.members;
                    } else if (Array.isArray(membersData)) {
                        normalizedMembers = membersData;
                    }
                }
                setMembers(normalizedMembers);
                if (!membersResponse.ok) {
                    console.error('Failed to fetch members:', membersResponse.status);
                }

                // Check if current user is team leader
                const loggedInUser = JSON.parse(localStorage.getItem('logged_in_user') || '{}');
                setCurrentUser(loggedInUser?.user_ID ? loggedInUser : null);
                const isLoggedLeader = loggedInUser.user_ID && teamData?.team_leader_id === loggedInUser.user_ID;
                setIsLeader(Boolean(isLoggedLeader));

                const isMember = normalizedMembers.some((m) => m.user_ID === loggedInUser.user_ID);
                setCanLeaveTeam(Boolean(isMember && !isLoggedLeader));

                setError(null);
            } catch (err) {
                console.error('Error fetching team data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [teamId]);

    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0)?.toUpperCase() || '';
        const last = lastName?.charAt(0)?.toUpperCase() || '';
        return `${first}${last}`;
    };

    const getUserInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : '?';
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    };

    const handleMemberClick = (userId) => {
        window.location.href = appUrl(`/players/${userId}`);
    };

    // Delete team handler
    const handleDeleteTeam = async () => {
        try {
            setDeleteLoading(true);
            const response = await apiFetch(`/api/teams/${teamId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Nepodarilo sa vymazať tím');
            }

            // Redirect to teams page
            window.location.href = appUrl('/teams');
        } catch (err) {
            console.error('Error deleting team:', err);
            alert('Chyba pri mazaní týmu: ' + err.message);
            setDeleteLoading(false);
        }
    };

    const handleLeaveTeam = async () => {
        if (!currentUser?.user_ID) {
            alert('Musíte byť prihlásený, aby ste mohli opustiť tím.');
            return;
        }
        if (isLeader) {
            alert('Správca tímu nemôže opustiť svoj tím.');
            return;
        }

        try {
            setLeaveLoading(true);
            const response = await apiFetch(`/api/teams/${teamId}/members`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_ID: currentUser.user_ID }),
            });

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Nepodarilo sa opustiť tím');
            }

            window.location.reload();
        } catch (err) {
            console.error('Error leaving team:', err);
            alert('Chyba pri opúšťaní tímu: ' + err.message);
            setLeaveLoading(false);
        }
    };

    // Edit team - open modal
    const handleEditTeam = async () => {
        try {
            // Fetch all players for validation
            const playersResponse = await apiFetch('/api/players');
            if (playersResponse.ok) {
                const { data: players } = await parseApiJson(playersResponse);
                setAllPlayers(players);
            }

            // Set current members as edit members
            setEditMembers([...members]);
            setEditTeamName(teamData?.team_name || '');
            setTeamNameError(null);
            setShowEditModal(true);
        } catch (err) {
            console.error('Error opening edit modal:', err);
        }
    };

    // Add member to edit list
    const handleAddMemberToEdit = () => {
        const username = newMemberUsername.trim();

        if (!username) {
            return;
        }

        // Check if already in list
        if (editMembers.some(m => m.user_name === username)) {
            setMemberError('Tento používateľ už je členom týmu');
            return;
        }

        // Find user
        const foundUser = allPlayers.find(p => p.user_name === username);
        if (!foundUser) {
            setMemberError('Používateľ s týmto používateľským menom neexistuje');
            return;
        }

        // Add to list
        setEditMembers([...editMembers, foundUser]);
        setNewMemberUsername('');
        setMemberError(null);
    };

    // Remove member from edit list
    const handleRemoveMemberFromEdit = (userId) => {
        setEditMembers(editMembers.filter(m => m.user_ID !== userId));
    };

    // Save edited team members
    const handleSaveTeamEdit = async () => {
        const trimmedName = editTeamName.trim();
        if (!trimmedName) {
            setTeamNameError('Názov tímu je povinný');
            return;
        }

        try {
            setEditLoading(true);
            setMemberError(null);
            setTeamNameError(null);

            const memberIds = editMembers.map(m => m.user_ID);

            const response = await apiFetch(`/api/teams/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_name: trimmedName,
                    members: memberIds
                })
            });

            if (!response.ok) {
                const { message } = await parseApiJson(response);
                throw new Error(message || 'Nepodarilo sa uložiť zmeny');
            }

            // Reload page to show updated members
            window.location.reload();
        } catch (err) {
            console.error('Error saving team edit:', err);
            setMemberError('Chyba pri ukladaní: ' + err.message);
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Tímy" />
                    <div className="text-center py-20">
                        <div className="animate-pulse text-blue-600 text-xl">Načítavam tím...</div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Tímy" />
                    <div className="max-w-2xl mx-auto py-20">
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                            <div className="text-red-600 text-2xl font-semibold mb-3">⚠️ Chyba</div>
                            <div className="text-red-500 mb-4">{error || 'Tím nenájdený'}</div>
                            <button
                                onClick={() => window.location.href = appUrl('/teams')}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Späť na zoznam tímov
                            </button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    // TODO: Fetch real tournament history from API
    const tournamentHistory = [];

    // TODO: Fetch real active tournaments from API
    const activeTournaments = [];

    // Calculate statistics
    const stats = {
        matchesPlayed: tournamentHistory.length,
        goldMedals: tournamentHistory.filter(t => t.position === 1).length,
        silverMedals: tournamentHistory.filter(t => t.position === 2).length,
        bronzeMedals: tournamentHistory.filter(t => t.position === 3).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Tímy" />

                {/* Breadcrumb */}
                <div className="px-6 py-3 bg-gradient-to-br from-gray-50 to-blue-50 border-b border-blue-200">
                    <div className="text-blue-600 text-sm">
                        <a href={appUrl('/')} className="hover:text-blue-800">Domov</a>
                        {' > '}
                        <a href={appUrl('/teams')} className="hover:text-blue-800">Tímy</a>
                        {' > '}
                        <span className="text-blue-900 font-semibold">{team.team_name}</span>
                    </div>
                </div>

                {/* Team Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-6 border-b-2 border-blue-200">
                    <div className="flex gap-6 items-start flex-wrap">
                        {/* Team Logo */}
                        <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                            {getInitials(team.team_name.split(' ')[0], team.team_name.split(' ')[1] || team.team_name.split(' ')[0])}
                        </div>

                        {/* Team Info */}
                        <div className="flex-1 min-w-[300px]">
                            <h1 className="text-4xl font-bold text-blue-900 mb-2">{team.team_name}</h1>
                            <div className="flex gap-8 mt-4 flex-wrap">
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">ČLENOV</div>
                                    <div className="text-2xl font-bold text-blue-900">{members.length}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">TURNAJE</div>
                                    <div className="text-2xl font-bold text-blue-900">{tournamentHistory.length}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">VÝHRY</div>
                                    <div className="text-2xl font-bold text-blue-900">{stats.goldMedals}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">BODY</div>
                                    <div className="text-2xl font-bold text-blue-900">{team.ranking || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Leader gets edit/delete, members can leave */}
                        {isLeader ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleEditTeam}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    ✏️ Upraviť tím
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                                >
                                    🗑️ Vymazať tím
                                </button>
                            </div>
                        ) : (
                            canLeaveTeam && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleLeaveTeam}
                                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap disabled:opacity-50"
                                        disabled={leaveLoading}
                                    >
                                        {leaveLoading ? 'Odpájam...' : '🚪 Opustiť tím'}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Left Column - Team Members */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                                <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                    👥 Členovia tímu ({members.length})
                                </h2>
                                {members.length === 0 ? (
                                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center">
                                        <div className="text-gray-500 text-lg">
                                            Tento tím nemá žiadnych členov
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {members.map((member) => (
                                            <div
                                                key={member.user_ID}
                                                className="border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                                                onClick={() => handleMemberClick(member.user_ID)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Member Avatar */}
                                                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {getUserInitial(member.user_name)}
                                                    </div>

                                                    {/* Member Details */}
                                                    <div className="flex-1">
                                                        <div className="font-bold text-blue-900 text-xl">
                                                            {member.user_name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {member.first_name} {member.last_name}
                                                        </div>
                                                    </div>

                                                    {/* Team Leader Badge */}
                                                    {member.user_ID === team.team_leader_id && (
                                                        <div className="px-3 py-1 bg-yellow-100 border-2 border-yellow-600 text-yellow-900 rounded-lg text-xs font-bold">
                                                            SPRÁVCA
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                                <h3 className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                    🏆 Štatistiky
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Odohrané zápasy</span>
                                        <span className="font-bold text-blue-900">{stats.matchesPlayed}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Zlaté medaily</span>
                                        <span className="font-bold text-blue-900">{stats.goldMedals} 🥇</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Strieborné medaily</span>
                                        <span className="font-bold text-blue-900">{stats.silverMedals} 🥈</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Bronzové medaily</span>
                                        <span className="font-bold text-blue-900">{stats.bronzeMedals} 🥉</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Tournaments */}
                            <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                                <h3 className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                    🎯 Aktuálne turnaje
                                </h3>
                                {activeTournaments.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        Žiadne aktuálne turnaje
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activeTournaments.map((tournament, index) => (
                                            <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                                                <span className="text-gray-600">{tournament.name}</span>
                                                <span className="font-bold text-blue-900">{tournament.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tournament History - Full Width */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                            📅 História turnajov
                        </h2>
                        {tournamentHistory.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center">
                                <div className="text-gray-500 text-lg">
                                    Tento tím sa zatiaľ nezúčastnil žiadneho turnaja
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-3 border-b-2 border-blue-200 font-bold text-blue-900">Turnaj</th>
                                            <th className="text-left p-3 border-b-2 border-blue-200 font-bold text-blue-900">Dátum</th>
                                            <th className="text-left p-3 border-b-2 border-blue-200 font-bold text-blue-900">Umiestnenie</th>
                                            <th className="text-left p-3 border-b-2 border-blue-200 font-bold text-blue-900">Body</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournamentHistory.map((tournament, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="p-3 border-b border-gray-200">{tournament.name}</td>
                                                <td className="p-3 border-b border-gray-200">{formatDate(tournament.date)}</td>
                                                <td className="p-3 border-b border-gray-200">
                                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                                                        tournament.position === 1 ? 'bg-yellow-100 border-2 border-yellow-600 text-yellow-900' :
                                                        tournament.position === 2 ? 'bg-gray-200 border-2 border-gray-600 text-gray-900' :
                                                        tournament.position === 3 ? 'bg-orange-100 border-2 border-orange-600 text-orange-900' :
                                                        'bg-blue-100 border-2 border-blue-600 text-blue-900'
                                                    }`}>
                                                        {tournament.position === 1 ? '🥇 1. miesto' :
                                                         tournament.position === 2 ? '🥈 2. miesto' :
                                                         tournament.position === 3 ? '🥉 3. miesto' :
                                                         `${tournament.position}. miesto`}
                                                    </span>
                                                </td>
                                                <td className="p-3 border-b border-gray-200 font-bold text-blue-900">
                                                    +{tournament.points} b.
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <Footer />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 rounded-t-xl">
                            <h2 className="text-2xl font-bold text-white">🗑️ Vymazať tím</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 text-lg mb-6">
                                Naozaj chcete vymazať tím <strong>{team.team_name}</strong>?
                            </p>
                            <p className="text-red-600 text-sm mb-6">
                                ⚠️ Táto akcia je nevratná a tím bude natrvalo odstránený.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                    disabled={deleteLoading}
                                >
                                    Zrušiť
                                </button>
                                <button
                                    onClick={handleDeleteTeam}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? 'Mažem...' : 'Vymazať'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Team Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-t-xl">
                            <h2 className="text-2xl font-bold text-white">✏️ Upraviť tím</h2>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                    👥 Členovia týmu
                                </h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Názov tímu
                                    </label>
                                    <input
                                        type="text"
                                        value={editTeamName}
                                        onChange={(e) => {
                                            setEditTeamName(e.target.value);
                                            setTeamNameError(null);
                                        }}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-gray-900 ${
                                            teamNameError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                        placeholder="Zadajte nový názov tímu"
                                        disabled={editLoading}
                                    />
                                    {teamNameError && (
                                        <div className="mt-2 text-sm text-red-600 font-semibold">
                                            ⚠ {teamNameError}
                                        </div>
                                    )}
                                </div>

                                {/* Add member input */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Používateľské meno člena
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMemberUsername}
                                            onChange={(e) => {
                                                setNewMemberUsername(e.target.value);
                                                setMemberError(null);
                                            }}
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none text-gray-900 ${
                                                memberError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                            placeholder="napr. jan123"
                                            disabled={editLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddMemberToEdit}
                                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            disabled={editLoading || !newMemberUsername.trim()}
                                        >
                                            + Pridať
                                        </button>
                                    </div>
                                    {memberError && (
                                        <div className="mt-2 text-sm text-red-600 font-semibold">
                                            ⚠ {memberError}
                                        </div>
                                    )}
                                </div>

                                {/* Members list */}
                                {editMembers.length > 0 && (
                                    <div>
                                        <div className="text-sm font-bold text-gray-700 mb-2">
                                            Členovia ({editMembers.length})
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {editMembers.map((member) => (
                                                <div
                                                    key={member.user_ID}
                                                    className="flex justify-between items-center px-4 py-3 bg-white border-2 border-blue-200 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-900">{member.user_name}</span>
                                                        {member.user_ID === team.team_leader_id && (
                                                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                                                SPRÁVCA
                                                            </span>
                                                        )}
                                                    </div>
                                                    {member.user_ID !== team.team_leader_id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMemberFromEdit(member.user_ID)}
                                                            className="text-red-600 hover:text-red-800 font-semibold text-sm disabled:opacity-50"
                                                            disabled={editLoading}
                                                        >
                                                            ✖ Odstrániť
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                    disabled={editLoading}
                                >
                                    Zrušiť
                                </button>
                                <button
                                    onClick={handleSaveTeamEdit}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50"
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Ukladám...' : 'Uložiť'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamDetailPage;
