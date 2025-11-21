import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import CreateTeamPage from './components/CreateTeamPage';

const rootElement = document.getElementById('create-team-app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<CreateTeamPage />);
}
