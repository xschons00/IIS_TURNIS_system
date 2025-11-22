import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import TournamentDetailPage from './components/TournamentDetailPage';

console.log('React tournament-detail.jsx is loading...');

const rootElement = document.getElementById('tournament-detail-app');
if (rootElement) {
    console.log('Root element found!');
    const root = createRoot(rootElement);
    root.render(<TournamentDetailPage />);
} else {
    console.error('Root element #tournament-detail-app not found!');
}
