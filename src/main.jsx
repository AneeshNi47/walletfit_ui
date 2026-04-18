import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

const stored = localStorage.getItem('fynbee-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.dataset.theme = stored || (prefersDark ? 'dark' : 'light');
const storedAccent = localStorage.getItem('fynbee-accent');
if (storedAccent) document.documentElement.dataset.accent = storedAccent;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
