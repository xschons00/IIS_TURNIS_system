import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import App from './components/App';

console.log('React app.jsx is loading...');

const rootElement = document.getElementById('app');
if (rootElement) {
    console.log('Root element found!');
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element #app not found!');
}
