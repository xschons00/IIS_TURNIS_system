import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import CreateTournamentPage from './components/CreateTournamentPage';

const rootElement = document.getElementById('create-tournament-app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<CreateTournamentPage />);
}
