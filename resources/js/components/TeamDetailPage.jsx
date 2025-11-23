import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';

function TeamDetailPage() {
    const pathParts = window.location.pathname.split('/');
    const teamId = pathParts[pathParts.length - 1];

    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLeader, setIsLeader] = useState(false);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);

                // Fetch team details
                const teamResponse = await apiFetch(`/api/teams/${teamId}`);
                if (!teamResponse.ok) {
                    throw new Error('Tím nenájdený');
                }
                const teamData = await teamResponse.json();
                setTeam(teamData);

                // Fetch team members
                const membersResponse = await apiFetch(`/api/teams/${teamId}/members`);
                if (membersResponse.ok) {
                    const membersData = await membersResponse.json();
                    console.log('Members data received:', membersData);
                    // Handle both array and object response formats
                    if (Array.isArray(membersData)) {
                        setMembers(membersData);
                    } else if (membersData.members && Array.isArray(membersData.members)) {
                        setMembers(membersData.members);
                    } else {
                        setMembers([]);
                    }
                } else {
                    console.error('Failed to fetch members:', membersResponse.status);
                    setMembers([]);
                }

                // Check if current user is team leader
                const loggedInUser = JSON.parse(localStorage.getItem('logged_in_user') || '{}');
                if (loggedInUser.user_ID && teamData.team_leader_id === loggedInUser.user_ID) {
                    setIsLeader(true);
                }

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

                        {/* Action Buttons - Only show if user is team leader */}
                        {isLeader && (
                            <div className="flex flex-col gap-2">
                                <button
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                    disabled
                                >
                                    ✏️ Upraviť tím
                                </button>
                                <button
                                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                                    disabled
                                >
                                    🗑️ Vymazať tím
                                </button>
                            </div>
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
        </div>
    );
}

export default TeamDetailPage;
