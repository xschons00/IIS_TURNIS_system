import React, { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email.trim() || !password.trim()) {
            setError('Email a heslo sú povinné');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Nepodarilo sa prihlásiť');
            }

            const data = await response.json();

            // Store token or session data
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
            }

            // Redirect to home page
            window.location.href = '/';
        } catch (err) {
            console.error('Error logging in:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Prihlásenie" />

                {/* Page Header */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-10 px-6 border-b border-blue-200">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">🔐 Prihlásenie</h1>
                    <p className="text-blue-700">
                        Prihláste sa do svojho účtu a pokračujte v turnajoch.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="m-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl text-red-600">⚠</span>
                            <div>
                                <div className="text-red-900 font-bold">Chyba pri prihlásení</div>
                                <div className="text-red-700 text-sm">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="max-w-md mx-auto">
                            {/* Email Field */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    placeholder="vas.email@example.com"
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Heslo <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block animate-spin mr-2">⟳</span>
                                        Prihlasovanie...
                                    </>
                                ) : (
                                    <>🔓 Prihlásiť sa</>
                                )}
                            </button>

                            {/* Register Link */}
                            <div className="text-center text-sm text-gray-600">
                                Nemáte účet?{' '}
                                <a href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                                    Zaregistrujte sa
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

export default LoginPage;
