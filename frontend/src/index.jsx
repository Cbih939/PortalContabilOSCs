// src/index.jsx (Mínimo React)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Mantenha o CSS

console.log("--- index.jsx (React) EXECUTADO ---");

function MinimalApp() {
  console.log("--- MinimalApp Componente Renderizado ---");
  return <h1>Olá Mundo via React!</h1>;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log("--- Elemento #root encontrado ---");
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <MinimalApp />
    </React.StrictMode>
  );
  console.log("--- React render chamado ---");
} else {
  console.error("--- ERRO CRÍTICO: Elemento #root NÃO encontrado! ---");
}