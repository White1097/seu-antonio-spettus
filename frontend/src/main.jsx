import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

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
            <HashRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </HashRouter>
        </ThemeProvider>
    </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((erro) => {
            console.warn('Não foi possível registrar o PWA:', erro);
        });
    });
}
