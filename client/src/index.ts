import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Get the root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// Render the app
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null,
      React.createElement(ThemeProvider, { theme },
        React.createElement(CssBaseline),
        React.createElement(AuthProvider, null,
          React.createElement(AppRouter)
        )
      )
    )
  )
);

// Re-export Firebase configuration
export * from './firebase';
