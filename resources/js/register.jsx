import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import RegisterPage from './components/RegisterPage';

const rootElement = document.getElementById('register-app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<RegisterPage />);
}
