import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import PlayersPage from './components/PlayersPage';

console.log('React players.jsx is loading...');

const rootElement = document.getElementById('players-app');
if (rootElement) {
    console.log('Root element found!');
    const root = createRoot(rootElement);
    root.render(<PlayersPage />);
} else {
    console.error('Root element #players-app not found!');
}
