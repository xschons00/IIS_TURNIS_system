import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminUsersPage from './components/AdminUsersPage';

const rootElement = document.getElementById('admin-users-app');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AdminUsersPage />
        </React.StrictMode>
    );
} else {
    console.error('Root element #admin-users-app not found');
}
