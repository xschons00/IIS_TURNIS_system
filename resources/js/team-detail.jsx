import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import TeamDetailPage from './components/TeamDetailPage';

console.log('React team-detail.jsx is loading...');

const rootElement = document.getElementById('team-detail-app');
if (rootElement) {
    console.log('Root element found!');
    const root = createRoot(rootElement);
    root.render(<TeamDetailPage />);
} else {
    console.error('Root element #team-detail-app not found!');
}
