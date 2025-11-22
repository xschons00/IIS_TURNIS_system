import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import PlayerProfilePage from './components/PlayerProfilePage';

console.log('React player-profile.jsx is loading...');

const rootElement = document.getElementById('player-profile-app');
if (rootElement) {
    console.log('Root element found!');
    const root = createRoot(rootElement);
    root.render(<PlayerProfilePage />);
} else {
    console.error('Root element #player-profile-app not found!');
}
