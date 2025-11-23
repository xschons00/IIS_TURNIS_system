import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApproveTournamentsPage from './components/AdminApproveTournamentsPage';

const rootElement = document.getElementById('admin-approve-tournaments-app');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AdminApproveTournamentsPage />
        </React.StrictMode>
    );
} else {
    console.error('Root element #admin-approve-tournaments-app not found');
}
