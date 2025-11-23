import React, { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        faculty: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.faculty || !formData.password.trim()) {
            setError('Všetky polia sú povinné');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Heslá sa nezhodujú');
            return;
        }

        if (formData.password.length < 6) {
            setError('Heslo musí mať aspoň 6 znakov');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: formData.username.trim(),
                    first_name: formData.firstName.trim(),
                    last_name: formData.lastName.trim(),
                    email: formData.email.trim(),
                    faculty: formData.faculty,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Nepodarilo sa zaregistrovať');
            }

            const data = await response.json();
            setSuccess(true);

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = appUrl('/login');
            }, 2000);
        } catch (err) {
            console.error('Error registering:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Registrácia" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-10 px-6 border-b border-blue-200">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">📝 Registrácia</h1>
                    <p className="text-blue-700">
                        Vytvorte si účet a pripojte sa k študentským turnajom.
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="m-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✓</span>
                            <div>
                                <div className="text-green-900 font-bold">Registrácia bola úspešná!</div>
                                <div className="text-green-700 text-sm">Presmerovávame vás na prihlasovaciu stránku...</div>
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
                                <div className="text-red-900 font-bold">Chyba pri registrácii</div>
                                <div className="text-red-700 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="max-w-md mx-auto">
                            {/* Personal Information */}
                            <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                                <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                    👤 Osobné údaje
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Používateľské meno <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. jan123"
                                        autoComplete="username"
                                        disabled={loading || success}
                                        required
                                    />
                                    <div className="mt-2 text-sm text-gray-600">
                                        Vaše jedinečné používateľské meno (nickname)
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Meno <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. Ján"
                                        autoComplete="given-name"
                                        disabled={loading || success}
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
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="napr. Novák"
                                        autoComplete="family-name"
                                        disabled={loading || success}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Fakulta <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        name="faculty"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        disabled={loading || success}
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
                            </div>

                            {/* Account Information */}
                            <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
                                <div className="text-xl font-bold text-blue-900 mb-4 pb-3 border-b-2 border-blue-300">
                                    🔐 Prihlasovacie údaje
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Email <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="vas.email@example.com"
                                        autoComplete="email"
                                        disabled={loading || success}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Heslo <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        disabled={loading || success}
                                        required
                                    />
                                    <div className="mt-2 text-sm text-gray-600">
                                        Heslo musí mať aspoň 6 znakov
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Potvrdiť heslo <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        disabled={loading || success}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block animate-spin mr-2">⟳</span>
                                        Registrácia...
                                    </>
                                ) : (
                                    <>✓ Zaregistrovať sa</>
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center text-sm text-gray-600">
                                Už máte účet?{' '}
                                <a href={appUrl('/login')} className="text-blue-600 hover:text-blue-800 font-semibold">
                                    Prihláste sa
                                </a>
                            </div>
                        </div>
                    </div>
                </form>

                <Footer />
            </div>
        </div>
    );
}

export default RegisterPage;
