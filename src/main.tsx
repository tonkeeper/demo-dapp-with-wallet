import './polyfills'
import './patch-local-storage-for-github-pages';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.scss';

if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => {
    eruda.init();
  });
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
