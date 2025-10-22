// src/App.jsx (Atualizado)
import React from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx'; // Importa as rotas
import './index.css'; // Importa estilos globais

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes /> {/* USA AS ROTAS */}
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;