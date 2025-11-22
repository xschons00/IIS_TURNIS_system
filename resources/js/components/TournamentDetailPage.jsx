import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';

function TournamentDetailPage() {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                setLoading(true);
                const response = await apiFetch(`/api/events/${id}`);
                if (!response.ok) {
                    throw new Error('Turnaj nenájdený');
                }
                const data = await response.json();
                setTournament(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching tournament:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id]);

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
                                onClick={() => window.location.href = '/tournaments'}
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
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-blue-900 mb-2">{tournament.event_name}</h1>
                            <p className="text-blue-700">{tournament.description || 'Popis turnaja nie je k dispozícii'}</p>
                        </div>
                        <div className="text-center">
                            <div className="px-6 py-2 bg-white border-2 border-blue-600 rounded-lg font-bold text-blue-900 mb-3">
                                REGISTRÁCIA OTVORENÁ
                            </div>
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all shadow-md whitespace-nowrap"
                                disabled
                            >
                                ✓ Registrovať sa na turnaj
                            </button>
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-4xl">
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">📅 Dátum:</span>
                            <span className="font-bold text-blue-900">{formatDate(tournament.event_date)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">👥 Typ:</span>
                            <span className="font-bold text-blue-900">{tournament.participation_type === 'individual' ? 'Jednotlivci' : 'Tímy'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">🎯 Kapacita:</span>
                            <span className="font-bold text-blue-900">0/{tournament.max_participants} obsadených</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">⚙️ Systém:</span>
                            <span className="font-bold text-blue-900">Vyraďovací (Pavúk)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">📍 Miesto:</span>
                            <span className="font-bold text-blue-900">{tournament.location || 'Neuvedené'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">💰 Vstupný poplatok:</span>
                            <span className="font-bold text-blue-900">{tournament.entry_fee || 'Zadarmo'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 min-w-[160px]">🏆 Výherná cena:</span>
                            <span className="font-bold text-blue-900">{tournament.prize || 'Neuvedené'}</span>
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
                                    <span className="text-gray-600">Vytvorené</span>
                                    <span className="font-bold text-blue-900">{formatDate(tournament.created_at)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Uzávierka prihlášok</span>
                                    <span className="font-bold text-blue-900">{formatDate(tournament.registration_deadline)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Začiatok turnaja</span>
                                    <span className="font-bold text-blue-900">{formatDateTime(tournament.event_date, tournament.start_time)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="text-gray-600">Kontakt</span>
                                    <span className="font-bold text-blue-900">{tournament.contact_email || 'Neuvedené'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bracket Section */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 mb-6">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                            🎯 Pavúk turnaja
                        </h2>
                        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center">
                            <div className="text-gray-500 text-lg">
                                Pavúk bude vygenerovaný po uzávierke registrácií
                            </div>
                        </div>
                    </div>

                    {/* Participants Section */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-200">
                            👥 Prihlásení účastníci (0/{tournament.max_participants})
                        </h2>
                        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8 text-center">
                            <div className="text-gray-500 text-lg">
                                Zatiaľ nie sú prihlásení žiadni účastníci
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default TournamentDetailPage;
