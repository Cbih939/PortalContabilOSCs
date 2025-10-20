// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Importa o componente <App /> principal
import App from './App';

// 2. Importa os estilos globais (incluindo o Tailwind CSS)
import './index.css';

// 3. Encontra o elemento 'root' no HTML
const rootElement = document.getElementById('root');

// 4. Cria a raiz (root) do React para renderização
const root = ReactDOM.createRoot(rootElement);

// 5. Renderiza a aplicação
root.render(
  // <React.StrictMode> ajuda a encontrar potenciais problemas
  // no seu código durante o desenvolvimento.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);