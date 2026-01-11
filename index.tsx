
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("DriveLog: React rendering started successfully.");
  } catch (error) {
    console.error("DriveLog: Critical error during initial render:", error);
    rootElement.innerHTML = `<div style="padding:20px; color:red;"><h1>渲染失敗</h1><p>${error.message}</p></div>`;
  }
} else {
  console.error("DriveLog: Could not find root element in DOM.");
}
