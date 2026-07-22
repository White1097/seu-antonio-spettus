import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

/* Sistema de Design */
import './styles/variables.css';
import './styles/animations.css';
import './styles/utilities.css';
import './styles/theme.css';

ReactDOM.createRoot(
    document.getElementById('root')
).render(
    <React.StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((erro) => {
            console.warn('Não foi possível registrar o PWA:', erro);
        });
    });
}
