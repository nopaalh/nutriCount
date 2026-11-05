import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app/router';
import { AppProviders } from './app/providers';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><AppProviders><AppRouter /></AppProviders></React.StrictMode>);
