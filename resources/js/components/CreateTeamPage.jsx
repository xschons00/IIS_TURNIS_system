import React, { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';

function CreateTeamPage() {
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [members, setMembers] = useState([]);
    const [contactEmail, setContactEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleAddMember = (e) => {
        e.preventDefault();
        if (memberEmail.trim() && !members.includes(memberEmail.trim())) {
            setMembers([...members, memberEmail.trim()]);
            setMemberEmail('');
        }
    };

    const handleRemoveMember = (emailToRemove) => {
        setMembers(members.filter(email => email !== emailToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!teamName.trim()) {
            setError('Názov týmu je povinný');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get logged in user
            const storedUser = localStorage.getItem('logged_in_user');
            if (!storedUser) {
                throw new Error('Musíte byť prihlásený na vytvorenie týmu');
            }
            const user = JSON.parse(storedUser);

            const response = await apiFetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team_name: teamName.trim(),
                    ranking: 0,
                    team_leader_id: user.user_ID
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Nepodarilo sa vytvoriť tím');
            }

            const data = await response.json();
            setSuccess(true);

            // Redirect to teams page after 2 seconds
            setTimeout(() => {
                window.location.href = appUrl('/teams');
            }, 2000);
        } catch (err) {
            console.error('Error creating team:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        window.location.href = appUrl('/teams');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Tímy" />

                {/* Breadcrumb */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="text-sm text-gray-600">
                        <a href={appUrl('/')} className="hover:text-blue-600">Domov</a>
                        <span className="mx-2">›</span>
                        <a href={appUrl('/teams')} className="hover:text-blue-600">Tímy</a>
                        <span className="mx-2">›</span>
                        <span className="text-gray-900 font-semibold">Vytvoriť nový tím</span>
                    </div>
                </div>

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-10 px-6 border-b border-blue-200">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">➕ Vytvoriť nový tím</h1>
                    <p className="text-blue-700">
                        Vytvorte tím a pozvite členov. Po vytvorení sa stanete správcom tímu.
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="m-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✓</span>
                            <div>
                                <div className="text-green-900 font-bold">Tím bol úspešne vytvorený!</div>
                                <div className="text-green-700 text-sm">Presmerovávame vás na zoznam tímov...</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="m-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl text-red-600">⚠</span>
                            <div>
                                <div className="text-red-900 font-bold">Chyba pri vytváraní týmu</div>
                                <div className="text-red-700 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        {/* Basic Information Section */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                📋 Základné informácie
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Názov týmu <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    placeholder="napr. Digital Warriors"
                                    disabled={loading || success}
                                    required
                                />
                                <div className="mt-2 text-sm text-gray-600">
                                    Zvoľte unikátny a výstižný názov pre váš tím
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                📝 Popis týmu
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Popis
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 resize-vertical"
                                    placeholder="Popíšte váš tím, jeho zameranie a ciele..."
                                    rows="4"
                                    disabled={loading || success}
                                />
                                <div className="mt-2 text-sm text-gray-600">
                                    Nepovinné pole - môžete uviesť informácie o tíme, ktoré budú viditeľné ostatným
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                👥 Členovia týmu
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email člena
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. hrac@example.com"
                                        disabled={loading || success}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddMember}
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading || success || !memberEmail.trim()}
                                    >
                                        + Pridať
                                    </button>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    Pridajte emailové adresy členov, ktorých chcete pozvať do týmu
                                </div>
                            </div>

                            {/* Members List */}
                            {members.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm font-bold text-gray-700 mb-2">
                                        Pridaní členovia ({members.length})
                                    </div>
                                    <div className="space-y-2">
                                        {members.map((email, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center px-4 py-3 bg-white border-2 border-blue-200 rounded-lg"
                                            >
                                                <span className="text-gray-900">{email}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(email)}
                                                    className="text-red-600 hover:text-red-800 font-semibold text-sm disabled:opacity-50"
                                                    disabled={loading || success}
                                                >
                                                    ✖ Odstrániť
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact Information Section */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                📧 Kontaktné informácie
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Kontaktný email
                                </label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    placeholder="napr. kontakt@tím.com"
                                    disabled={loading || success}
                                />
                                <div className="mt-2 text-sm text-gray-600">
                                    Nepovinné pole - kontaktný email pre komunikáciu s tímom
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-600 text-xl">ℹ️</span>
                                <div className="text-sm text-blue-800">
                                    <div className="font-semibold mb-1">Poznámka</div>
                                    <div>
                                        Po vytvorení týmu budete automaticky priradený ako správca.
                                        Členov a ďalšie informácie môžete upraviť neskôr v nastaveniach týmu.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 justify-end px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md"
                            disabled={loading || success}
                        >
                            ✖ Zrušiť
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block animate-spin mr-2">⟳</span>
                                    Vytváram...
                                </>
                            ) : (
                                <>✓ Vytvoriť tím</>
                            )}
                        </button>
                    </div>
                </form>

                <Footer />
            </div>
        </div>
    );
}

export default CreateTeamPage;
