import React from 'react';
import ReactDOM from 'react-dom/client';
import TournamentsPage from './components/TournamentsPage';

console.log('React tournaments.jsx is loading...');

const root = document.getElementById('tournaments-app');
console.log('Tournaments root element found!', root);

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <TournamentsPage />
        </React.StrictMode>
    );
}
