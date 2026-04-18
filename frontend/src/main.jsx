import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CommandPalette from '@/components/CommandPalette';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <CommandPalette />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg)' } },
          error:   { iconTheme: { primary: 'var(--hard)',   secondary: 'var(--bg)' } },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);