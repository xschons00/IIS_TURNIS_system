import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { appUrl } from '../utils/url';

function Header() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Check if user is logged in (from localStorage)
        try {
            const storedUser = localStorage.getItem('logged_in_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error('Error loading user from localStorage:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        // Remove user from localStorage
        localStorage.removeItem('logged_in_user');

        // Call logout API (optional, for backend session cleanup)
        apiFetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(err => {
            console.error('Error calling logout API:', err);
        });

        // Redirect to home
        window.location.href = appUrl('/');
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-5 border-b-2 border-blue-700 flex justify-between items-center shadow-lg">
            <div className="text-2xl font-bold text-white">🏆 ŠTUDENTSKÉ TURNAJE</div>

            {loading ? (
                <div className="text-white">Načítavam...</div>
            ) : user ? (
                // Logged in view
                <div className="flex gap-2.5 items-center relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-white bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <span>👤</span>
                        <span>{user.first_name} {user.last_name}</span>
                        <span className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {/* Dropdown menu */}
                    {showDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-blue-200 z-50">
                            <div className="p-3 border-b border-blue-100">
                                <div className="text-sm text-gray-600">Prihlásený ako:</div>
                                <div className="font-bold text-blue-900">{user.email}</div>
                            </div>
                            <button
                                onClick={() => alert('Player profile - zatiaľ neimplementované')}
                                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                            >
                                <span>👤</span>
                                <span>Môj profil</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-blue-100"
                            >
                                <span>➜|</span>
                                <span>Odhlásiť sa</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Not logged in view
                <div className="flex gap-2.5">
                    <a href={appUrl('/login')} className="px-4 py-2 border-2 border-white bg-white text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 rounded-lg transition-colors">
                        Prihlásiť sa
                    </a>
                    <a href={appUrl('/register')} className="px-4 py-2 border-2 border-white bg-transparent text-white font-semibold cursor-pointer hover:bg-white hover:text-blue-600 rounded-lg transition-colors">
                        Registrovať sa
                    </a>
                </div>
            )}
        </div>
    );
}

export default Header;
