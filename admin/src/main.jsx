import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import useAuthStore from './store/authStore';

// Run rehydrate synchronously before first render so AdminGuard has correct state
useAuthStore.getState().rehydrate();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              fontFamily: 'Outfit, sans-serif',
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
