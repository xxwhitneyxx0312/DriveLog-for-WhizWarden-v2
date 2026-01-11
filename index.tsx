
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) return;
  
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("DriveLog Pro: Ready");
  } catch (error) {
    const debug = document.getElementById('debug-console');
    if (debug) {
      debug.style.display = 'block';
      debug.innerHTML += '<div>Render Fail: ' + error.message + '</div>';
    }
  }
};

// 確保在腳本載入後立即執行
mountApp();
