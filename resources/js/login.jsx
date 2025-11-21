import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './components/LoginPage';

const rootElement = document.getElementById('login-app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<LoginPage />);
}
