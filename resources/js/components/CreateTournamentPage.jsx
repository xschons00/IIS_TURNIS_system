import React, { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';

function CreateTournamentPage() {
    const [tournamentName, setTournamentName] = useState('');
    const [sport, setSport] = useState('');
    const [description, setDescription] = useState('');
    const [participationType, setParticipationType] = useState('individual');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [gameSystem, setGameSystem] = useState('knockout');
    const [eventDate, setEventDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [location, setLocation] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [prize, setPrize] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!tournamentName.trim() || !sport || !maxParticipants || !eventDate) {
            setError('Názov turnaja, šport/hra, maximálny počet účastníkov a dátum konania sú povinné');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch('/api/tournaments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_name: tournamentName.trim(),
                    sport: sport,
                    description: description.trim() || null,
                    participation_type: participationType,
                    max_participants: parseInt(maxParticipants),
                    team_size: teamSize ? parseInt(teamSize) : null,
                    game_system: gameSystem,
                    event_date: eventDate,
                    start_time: startTime || null,
                    location: location.trim() || null,
                    registration_deadline: registrationDeadline || null,
                    entry_fee: entryFee.trim() || null,
                    prize: prize.trim() || null,
                    contact_email: contactEmail.trim() || null,
                    contact_phone: contactPhone.trim() || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Nepodarilo sa vytvoriť turnaj');
            }

            const data = await response.json();
            setSuccess(true);

            // Redirect to tournaments page after 2 seconds
            setTimeout(() => {
                window.location.href = appUrl('/tournaments');
            }, 2000);
        } catch (err) {
            console.error('Error creating tournament:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Turnaje" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-10 px-6 border-b border-blue-200">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">➕ Vytvoriť nový turnaj</h1>
                    <p className="text-blue-700">
                        Vyplňte základné informácie o turnaji. Po vytvorení sa stanete správcom turnaja.
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="m-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✓</span>
                            <div>
                                <div className="text-green-900 font-bold">Turnaj bol úspešne vytvorený!</div>
                                <div className="text-green-700 text-sm">Presmerovávame vás na zoznam turnajov...</div>
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
                                <div className="text-red-900 font-bold">Chyba pri vytváraní turnaja</div>
                                <div className="text-red-700 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        {/* Basic Information */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                📋 Základné informácie
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Názov turnaja <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={tournamentName}
                                    onChange={(e) => setTournamentName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    placeholder="napr. Šachový turnaj 2025"
                                    disabled={loading || success}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Šport/Hra <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={sport}
                                    onChange={(e) => setSport(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    disabled={loading || success}
                                    required
                                >
                                    <option value="">-- Vyberte šport/hru --</option>
                                    <option value="chess">Šach</option>
                                    <option value="darts">Šípky</option>
                                    <option value="table-tennis">Stolný tenis</option>
                                    <option value="csgo">CS:GO</option>
                                    <option value="fifa">FIFA</option>
                                    <option value="lol">League of Legends</option>
                                    <option value="beer">Konzumácia piva</option>
                                    <option value="other">Iné</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Popis turnaja
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 resize-vertical"
                                    placeholder="Popíšte turnaj, pravidlá, program, atď..."
                                    rows="4"
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        {/* Tournament Settings */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                ⚙️ Nastavenia turnaja
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Typ účasti <span className="text-red-600">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${participationType === 'individual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                                        <input
                                            type="radio"
                                            name="participationType"
                                            value="individual"
                                            checked={participationType === 'individual'}
                                            onChange={(e) => setParticipationType(e.target.value)}
                                            disabled={loading || success}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-gray-900 font-semibold">👤 Jednotlivci</span>
                                    </label>
                                    <label className={`flex-1 flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${participationType === 'team' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                                        <input
                                            type="radio"
                                            name="participationType"
                                            value="team"
                                            checked={participationType === 'team'}
                                            onChange={(e) => setParticipationType(e.target.value)}
                                            disabled={loading || success}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-gray-900 font-semibold">👥 Tímy</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Maximálny počet účastníkov/tímov <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. 16"
                                        min="2"
                                        disabled={loading || success}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Počet hráčov v tíme
                                    </label>
                                    <input
                                        type="number"
                                        value={teamSize}
                                        onChange={(e) => setTeamSize(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. 5"
                                        min="1"
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Herný systém <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={gameSystem}
                                    onChange={(e) => setGameSystem(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    disabled={loading || success}
                                    required
                                >
                                    <option value="knockout">Vyraďovací systém (Pavúk)</option>
                                </select>
                            </div>
                        </div>

                        {/* Date and Location */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                📅 Dátum a miesto
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Dátum konania <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        disabled={loading || success}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Čas začiatku
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Miesto konania
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    placeholder="napr. Aula A112, FIT VUT"
                                    disabled={loading || success}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Uzávierka prihlášok
                                </label>
                                <input
                                    type="date"
                                    value={registrationDeadline}
                                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        {/* Entry and Prize */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                💰 Vstupné a výhry
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Vstupný poplatok
                                    </label>
                                    <input
                                        type="text"
                                        value={entryFee}
                                        onChange={(e) => setEntryFee(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. Zadarmo alebo 5€"
                                        disabled={loading || success}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Výherná cena
                                    </label>
                                    <input
                                        type="text"
                                        value={prize}
                                        onChange={(e) => setPrize(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. Pohár + 50€"
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                            <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                📞 Kontaktné informácie
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Kontaktný email
                                    </label>
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="vas.email@student.sk"
                                        disabled={loading || success}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Telefón
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="+421 123 456 789"
                                        disabled={loading || success}
                                    />
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
                                        Po vytvorení turnaja budete automaticky priradený ako správca turnaja a budete môcť spravovať účastníkov a výsledky.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => window.location.href = appUrl('/tournaments')}
                                className="px-6 py-3 border-2 border-gray-400 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        Vytváranie...
                                    </>
                                ) : (
                                    <>✓ Vytvoriť turnaj</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <Footer />
            </div>
        </div>
    );
}

export default CreateTournamentPage;
