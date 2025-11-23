import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { appUrl } from '../utils/url';

function PlayerProfilePage() {
    // Get player ID from URL path
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Edit profile modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        faculty: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        const fetchPlayerProfile = async () => {
            try {
                setLoading(true);

                // Fetch player data
                const response = await fetch(`http://localhost:8080/api/players/${id}`);
                if (!response.ok) {
                    throw new Error('Hráč nenájdený');
                }

                const data = await response.json();

                // Check if this is the logged-in user's profile
                const storedUser = localStorage.getItem('logged_in_user');
                if (storedUser) {
                    const loggedInUser = JSON.parse(storedUser);
                    setIsOwnProfile(loggedInUser.user_ID === data.user_ID);
                }

                setPlayer(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching player profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerProfile();
    }, [id]);

    // Get player initial from username
    const getUserInitial = (username) => {
        if (!username) return '?';
        return username.charAt(0).toUpperCase();
    };

    // Format date from ISO to Slovak format
    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}. ${month}. ${year}`;
    };

    // Open edit modal
    const handleEditProfile = () => {
        setEditFormData({
            firstName: player.first_name || '',
            lastName: player.last_name || '',
            faculty: player.faculty || ''
        });
        setEditError(null);
        setShowEditModal(true);
    };

    // Handle form change
    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    // Save profile changes
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.faculty) {
            setEditError('Všetky polia sú povinné');
            return;
        }

        try {
            setEditLoading(true);
            setEditError(null);

            const response = await fetch(`http://localhost:8080/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: player.user_ID,
                    first_name: editFormData.firstName.trim(),
                    last_name: editFormData.lastName.trim(),
                    faculty: editFormData.faculty
                })
            });

            if (!response.ok) {
                throw new Error('Nepodarilo sa aktualizovať profil');
            }

            const updatedPlayer = await response.json();

            // Update player state
            setPlayer(updatedPlayer);

            // Update localStorage if it's own profile
            if (isOwnProfile) {
                const storedUser = localStorage.getItem('logged_in_user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.first_name = updatedPlayer.first_name;
                    user.last_name = updatedPlayer.last_name;
                    user.faculty = updatedPlayer.faculty;
                    localStorage.setItem('logged_in_user', JSON.stringify(user));
                }
            }

            // Close modal
            setShowEditModal(false);

            // Reload page to reflect changes
            window.location.reload();
        } catch (err) {
            console.error('Error updating profile:', err);
            setEditError(err.message);
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Hráči" />
                    <div className="text-center py-20">
                        <div className="animate-pulse text-blue-600 text-xl">Načítavam profil...</div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Hráči" />
                    <div className="max-w-2xl mx-auto py-20">
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                            <div className="text-red-600 text-2xl font-semibold mb-3">
                                ⚠️ Chyba
                            </div>
                            <div className="text-red-500 mb-4">
                                {error || 'Hráč nenájdený'}
                            </div>
                            <button
                                onClick={() => window.location.href = appUrl('/players')}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Späť na zoznam hráčov
                            </button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    // Mock data - TODO: Replace with real API data
    const stats = {
        totalPoints: player.ranking || 0,
        tournaments: 0,
        wins: 0,
        rank: 1,
        matchesPlayed: 0,
        finals: 0,
        semifinals: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0
    };

    const tournamentHistory = [];
    const teams = [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Hráči" />

                {/* Breadcrumb */}
                <div className="px-6 py-3 bg-gradient-to-br from-gray-50 to-blue-50 border-b border-blue-200">
                    <div className="text-blue-600 text-sm">
                        <a href={appUrl('/')} className="hover:text-blue-800">Domov</a>
                        {' > '}
                        <a href={appUrl('/players')} className="hover:text-blue-800">Hráči</a>
                        {' > '}
                        <span className="text-blue-900 font-semibold">
                            {player.user_name}
                        </span>
                    </div>
                </div>

                {/* Profile Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-6 border-b-2 border-blue-200">
                    <div className="flex gap-8 items-start flex-wrap">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 border-white flex-shrink-0">
                            {getUserInitial(player.user_name)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-5xl font-bold text-blue-900 mb-2">
                                {player.user_name}
                            </h1>
                            <div className="text-xl text-gray-700 mb-1">
                                {player.first_name} {player.last_name}
                            </div>
                            <div className="text-blue-600 mb-4">{player.email}</div>

                            <div className="flex gap-8 flex-wrap">
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">CELKOVÉ BODY</div>
                                    <div className="text-2xl font-bold text-blue-900">{stats.totalPoints.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">TURNAJE</div>
                                    <div className="text-2xl font-bold text-blue-900">{stats.tournaments}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">VÝHRY</div>
                                    <div className="text-2xl font-bold text-blue-900">{stats.wins}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">UMIESTNENIE</div>
                                    <div className="text-2xl font-bold text-blue-900">#{stats.rank}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {isOwnProfile && (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleEditProfile}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md whitespace-nowrap"
                                >
                                    ✏️ Upraviť profil
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Statistics Section */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                📊 Štatistiky
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white text-center">
                                    <div className="text-sm text-blue-600 mb-2">ODOHRATÉ ZÁPASY</div>
                                    <div className="text-3xl font-bold text-blue-900">{stats.matchesPlayed}</div>
                                </div>
                                <div className="border-2 border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-white text-center">
                                    <div className="text-sm text-green-600 mb-2">VÝHRY</div>
                                    <div className="text-3xl font-bold text-green-900">{stats.wins}</div>
                                </div>
                                <div className="border-2 border-yellow-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-white text-center">
                                    <div className="text-sm text-yellow-600 mb-2">FINÁLE</div>
                                    <div className="text-3xl font-bold text-yellow-900">{stats.finals}</div>
                                </div>
                                <div className="border-2 border-orange-200 rounded-lg p-4 bg-gradient-to-br from-orange-50 to-white text-center">
                                    <div className="text-sm text-orange-600 mb-2">SEMIFINÁLE</div>
                                    <div className="text-3xl font-bold text-orange-900">{stats.semifinals}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tournament History */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                🏅 História turnajov
                            </h2>
                            {tournamentHistory.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Žiadna história turnajov
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b-2 border-blue-200">
                                                <th className="py-3 px-4 text-left font-bold text-blue-900">Turnaj</th>
                                                <th className="py-3 px-4 text-left font-bold text-blue-900">Dátum</th>
                                                <th className="py-3 px-4 text-left font-bold text-blue-900">Umiestnenie</th>
                                                <th className="py-3 px-4 text-left font-bold text-blue-900">Body</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tournamentHistory.map((tournament, index) => (
                                                <tr key={index} className={`border-b border-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="py-3 px-4">{tournament.name}</td>
                                                    <td className="py-3 px-4">{tournament.date}</td>
                                                    <td className="py-3 px-4">{tournament.placement}</td>
                                                    <td className="py-3 px-4">{tournament.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Teams Section */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                👥 Tímy
                            </h2>
                            {teams.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Hráč nie je členom žiadneho tímu
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {teams.map((team, index) => (
                                        <div key={index} className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white flex justify-between items-center hover:shadow-md transition-shadow">
                                            <div>
                                                <div className="font-bold text-blue-900 text-lg">{team.name}</div>
                                                <div className="text-blue-600 text-sm">{team.sport}</div>
                                                <div className="text-gray-600 text-sm mt-1">{team.members} členov</div>
                                            </div>
                                            <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                                Detail
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Personal Info */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                ℹ️ Osobné informácie
                            </h3>
                            <div className="space-y-3">
                                {player.faculty && (
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Fakulta</span>
                                        <span className="font-bold text-blue-900">
                                            {player.faculty === 'ENGINEERING' && 'Inžinierstvo'}
                                            {player.faculty === 'CHEMISTRY' && 'Chémia'}
                                            {player.faculty === 'COMPUTER_SCIENCE' && 'Informatika'}
                                            {player.faculty === 'BUSINESS' && 'Ekonómia'}
                                            {player.faculty === 'ARTS' && 'Umenie'}
                                            {player.faculty === 'MATHEMATICS' && 'Matematika'}
                                            {player.faculty === 'PHYSICS' && 'Fyzika'}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Aktuálne turnaje</span>
                                    <span className="font-bold text-blue-900">0</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Registrovaný</span>
                                    <span className="font-bold text-blue-900">{formatDate(player.created_at)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Posledná aktivita</span>
                                    <span className="font-bold text-blue-900">{formatDate(player.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                                🏆 Úspechy
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Zlaté medaily</span>
                                    <span className="font-bold text-yellow-600">{stats.goldMedals} 🥇</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Strieborné medaily</span>
                                    <span className="font-bold text-gray-400">{stats.silverMedals} 🥈</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Bronzové medaily</span>
                                    <span className="font-bold text-orange-600">{stats.bronzeMedals} 🥉</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-t-xl">
                            <h2 className="text-2xl font-bold text-white">✏️ Upraviť profil</h2>
                        </div>

                        <form onSubmit={handleSaveProfile} className="p-6">
                            {editError && (
                                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                                    {editError}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Meno <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={editFormData.firstName}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    disabled={editLoading}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Priezvisko <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={editFormData.lastName}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    disabled={editLoading}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Fakulta <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="faculty"
                                    value={editFormData.faculty}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    disabled={editLoading}
                                    required
                                >
                                    <option value="">-- Vyberte fakultu --</option>
                                    <option value="ENGINEERING">Inžinierstvo (Engineering)</option>
                                    <option value="CHEMISTRY">Chémia (Chemistry)</option>
                                    <option value="COMPUTER_SCIENCE">Informatika (Computer Science)</option>
                                    <option value="BUSINESS">Ekonómia (Business)</option>
                                    <option value="ARTS">Umenie (Arts)</option>
                                    <option value="MATHEMATICS">Matematika (Mathematics)</option>
                                    <option value="PHYSICS">Fyzika (Physics)</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                    disabled={editLoading}
                                >
                                    Zrušiť
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50"
                                    disabled={editLoading}
                                >
                                    {editLoading ? 'Ukladám...' : 'Uložiť'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlayerProfilePage;
