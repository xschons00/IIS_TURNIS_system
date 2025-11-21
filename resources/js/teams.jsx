import React from 'react';
import ReactDOM from 'react-dom/client';
import TeamsPage from './components/TeamsPage';

console.log('teams.jsx loading');

const root = document.getElementById('teams-app');

if (root) {
    console.log('Mounting TeamsPage component');
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <TeamsPage />
        </React.StrictMode>
    );
} else {
    console.error('Root element #teams-app not found');
}
