import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { apiFetch, parseApiJson } from '../utils/api';
import { appUrl } from '../utils/url';

const roleLabels = {
    ADMIN: 'Admin',
    USER: 'Používateľ',
};

const facultyLabels = {
    ENGINEERING: 'Strojárstvo',
    CHEMISTRY: 'Chémia',
    COMPUTER_SCIENCE: 'Informatika',
    BUSINESS: 'Ekonomika',
    ARTS: 'Umenie',
    MATHEMATICS: 'Matematika',
    PHYSICS: 'Fyzika',
};

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('ALL');
    const [user, setUser] = useState(null);
    const [deleting, setDeleting] = useState({});
    const [flash, setFlash] = useState('');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('logged_in_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error('Error loading user', err);
        }
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await apiFetch('/api/players', {
                    credentials: 'include',
                });
                if (res.status === 401) {
                    throw new Error('Na zobrazenie používateľov sa musíte prihlásiť ako admin.');
                }
                if (!res.ok) {
                    throw new Error('Nepodarilo sa načítať používateľov.');
                }
                const { data } = await parseApiJson(res);
                setUsers(Array.isArray(data) ? data : []);
                setError('');
            } catch (err) {
                console.error(err);
                setError(err.message || 'Nepodarilo sa načítať používateľov.');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return users
            .filter((u) => u.role !== 'ADMIN') // exclude admins from listing/filtering
            .filter((u) => {
                if (facultyFilter === 'ALL') return true;
                if (facultyFilter === 'OTHER') {
                    return !u.faculty || !facultyLabels[u.faculty];
                }
                return (u.faculty || '') === facultyFilter;
            })
            .filter((u) => {
                if (!query) return true;
                const text = `${u.first_name || ''} ${u.last_name || ''} ${u.user_name || ''} ${u.email || ''} ${u.faculty || ''}`
                    .toLowerCase();
                return text.includes(query);
            })
            .sort((a, b) => (a.user_ID || 0) - (b.user_ID || 0)); // sort by ID
    }, [users, search, facultyFilter]);

    const isAdmin = user?.role === 'ADMIN';

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Naozaj chcete odstrániť tohto používateľa? Táto akcia je nezvratná.');
        if (!confirmed) return;

        try {
            setDeleting((prev) => ({ ...prev, [id]: true }));
            setFlash('');
            const res = await apiFetch(`/api/players/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.status === 401 || res.status === 403) {
                throw new Error('Na odstránenie musíte byť prihlásený ako admin.');
            }
            if (!res.ok) {
                const { message } = await parseApiJson(res);
                throw new Error(message || 'Odstránenie zlyhalo');
            }
            setUsers((prev) => prev.filter((u) => u.user_ID !== id));
            setFlash('Používateľ bol odstránený.');
        } catch (err) {
            alert(err.message || 'Odstránenie zlyhalo');
        } finally {
            setDeleting((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <Header />
                    <Navigation activePage="Admin Panel" />
                    <div className="p-10 text-center space-y-4">
                        <div className="text-3xl">🔒</div>
                        <div className="text-2xl font-bold text-blue-900">Táto sekcia je len pre administrátorov.</div>
                        <div className="text-blue-700">
                            Prihláste sa ako admin, aby ste mohli spravovať používateľov.
                        </div>
                        <a
                            href={appUrl('/login')}
                            className="inline-block px-5 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition-colors"
                        >
                            Prejsť na prihlásenie
                        </a>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 p-5">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Header />
                <Navigation activePage="Admin Panel" />

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 md:px-10 py-10 border-b border-blue-100">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm text-blue-700">
                            <span className="px-2 py-1 bg-blue-100 border border-blue-200 rounded-md">⚙️ Admin Panel</span>
                            <span className="text-blue-500">/</span>
                            <span>Správa používateľov</span>
                        </div>
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Správa používateľov</h1>
                                <p className="text-blue-800">
                                    Rýchly prehľad registrovaných používateľov. Filtrovanie podľa mena, emailu a role.
                                </p>
                            </div>
                            <div className="px-4 py-2 bg-white border-2 border-blue-200 rounded-lg text-blue-800 shadow-sm">
                                <div className="text-xs uppercase text-blue-500 font-semibold">Administrátor</div>
                                <div className="font-bold">{user?.first_name} {user?.last_name}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-b border-blue-100 px-6 md:px-10 py-4">
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={appUrl('/admin/users')}
                            className="px-4 py-2 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-md"
                        >
                            👥 Správa používateľov
                        </a>
                        <a
                            href={appUrl('/admin/approve-tournaments')}
                            className="px-4 py-2 rounded-full border-2 border-blue-200 bg-white text-blue-800 font-semibold shadow-sm"
                        >
                            ✅ Schvaľovanie turnajov
                        </a>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-[600px]">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="🔍 Hľadať podľa mena, emailu alebo používateľského mena"
                            className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none bg-white"
                        />
                        <select
                            value={facultyFilter}
                            onChange={(e) => setFacultyFilter(e.target.value)}
                            className="px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm bg-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="ALL">Všetky fakulty</option>
                            {Object.keys(facultyLabels).map((key) => (
                                <option key={key} value={key}>
                                    {facultyLabels[key]}
                                </option>
                            ))}
                            <option value="OTHER">Bez fakulty/ostatné</option>
                        </select>
                        <div className="px-4 py-3 bg-white border-2 border-blue-200 rounded-lg shadow-sm text-blue-800">
                            Načítané: <strong>{users.filter((u) => u.role !== 'ADMIN').length}</strong> / Filtrované: <strong>{filteredUsers.length}</strong>
                        </div>
                    </div>

                    {flash && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-800">
                            {flash}
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white border-2 border-blue-100 rounded-lg p-6 text-center text-blue-700">
                            Načítavam používateľov...
                        </div>
                    ) : error ? (
                        <div className="bg-white border-2 border-red-200 rounded-lg p-6 text-center text-red-700">
                            {error}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="bg-white border-2 border-blue-100 rounded-lg p-6 text-center text-blue-700">
                            Žiadni používatelia podľa aktuálneho filtra.
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white border-2 border-blue-100 rounded-xl shadow-sm">
                            <table className="min-w-full text-left">
                                <thead className="bg-blue-50 text-blue-900 text-sm">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-blue-100">ID</th>
                                        <th className="px-4 py-3 border-b border-blue-100">Meno</th>
                                        <th className="px-4 py-3 border-b border-blue-100">Používateľ</th>
                                        <th className="px-4 py-3 border-b border-blue-100">Email</th>
                                        <th className="px-4 py-3 border-b border-blue-100">Fakulta</th>
                                        <th className="px-4 py-3 border-b border-blue-100">Rola</th>
                                        <th className="px-4 py-3 border-b border-blue-100">Profil</th>
                                        <th className="px-4 py-3 border-b border-blue-100 text-right">Akcie</th>
                                    </tr>
                                </thead>
                                <tbody className="text-blue-800">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.user_ID} className="border-b border-blue-50 last:border-0">
                                            <td className="px-4 py-3 font-semibold text-blue-900">#{u.user_ID}</td>
                                            <td className="px-4 py-3">
                                                {(u.first_name || '') + ' ' + (u.last_name || '')}
                                            </td>
                                            <td className="px-4 py-3">{u.user_name}</td>
                                            <td className="px-4 py-3">{u.email}</td>
                                            <td className="px-4 py-3">
                                                {facultyLabels[u.faculty] || u.faculty || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${u.role === 'ADMIN'
                                                    ? 'bg-purple-50 border-purple-200 text-purple-800'
                                                    : 'bg-green-50 border-green-200 text-green-800'
                                                }`}>
                                                    {roleLabels[u.role] || u.role || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <a
                                                    href={appUrl(`/players/${u.user_ID}`)}
                                                    className="px-3 py-1 text-blue-700 font-semibold border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors inline-block"
                                                >
                                                    👁️ Otvoriť
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(u.user_ID)}
                                                    className="px-3 py-1 text-red-700 font-semibold border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                                                    disabled={!!deleting[u.user_ID]}
                                                >
                                                    {deleting[u.user_ID] ? '⟳ Mažem...' : '🗑️ Zmazať'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </div>
    );
}

export default AdminUsersPage;
