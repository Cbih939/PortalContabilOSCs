// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// --- INÍCIO DO SCRIPT ANTI-CACHE (DESTRÓI QUALQUER VERSÃO ANTIGA PRESA) ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🧹 ServiceWorker antigo removido com sucesso.');
    }
  });
}

if ('caches' in window) {
  caches.keys().then((names) => {
    for (let name of names) {
      caches.delete(name);
      console.log(`🧹 Cache antiga apagada: ${name}`);
    }
  });
}
// --- FIM DO SCRIPT ANTI-CACHE ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);