
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 確保 DOM 已加載
const init = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      const root = createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log("React app rendered successfully");
    } catch (err) {
      console.error("Render error:", err);
      const debug = document.getElementById('debug-console');
      if (debug) {
        debug.style.display = 'block';
        debug.innerText += "\nRender Error: " + err.message;
      }
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
