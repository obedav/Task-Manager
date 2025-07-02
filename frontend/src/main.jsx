// src/main.jsx - Clean Entry Point
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Provide app config to HTML
window.__APP_CONFIG__ = {
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  isProduction: import.meta.env.VITE_ENVIRONMENT === 'production',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
};

// Fix console override issues in development
if (import.meta.env.DEV) {
  // Store original console methods
  const originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console)
  };

  // Detect and fix problematic console overrides
  const fixConsoleOverrides = () => {
    try {
      const isOverridden = console.log.toString().includes('overrideMethod') ||
                          console.error.toString().includes('overrideMethod');
      
      if (isOverridden) {
        console.log('🔧 Fixing console overrides...');
        Object.assign(console, originalConsole);
        console.log('✅ Console methods restored');
      }
    } catch (e) {
      console.error = originalConsole.error;
    }
  };

  // Apply fixes
  fixConsoleOverrides();
  setTimeout(fixConsoleOverrides, 100);
  setTimeout(fixConsoleOverrides, 500);
}

// Global error handlers
window.addEventListener('error', (event) => {
  try {
    const errorInfo = {
      message: event.error?.message || event.message || 'Unknown error',
      filename: event.filename || 'Unknown file',
      timestamp: new Date().toISOString()
    };

    if (import.meta.env.DEV) {
      console.error('🚨 Global Error:', errorInfo);
    }
  } catch (e) {
    console.error('Error in error handler');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  try {
    if (import.meta.env.DEV) {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    }
  } catch (e) {
    console.error('Error in promise rejection handler');
  }
});

// Render the app
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ TaskFlow app started successfully');
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  
  // Fallback UI
  document.getElementById('root').innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
      color: white;
    ">
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #ef4444; margin-bottom: 16px;">App Failed to Load</h1>
        <p style="margin-bottom: 20px;">Please refresh the page</p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 16px;
          "
        >
          Refresh Page
        </button>
      </div>
    </div>
  `;
}