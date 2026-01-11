
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 確保 DOM 載入後才執行
const mountApp = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
} else {
    mountApp();
}
