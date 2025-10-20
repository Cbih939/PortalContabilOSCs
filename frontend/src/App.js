// src/App.js

import React from 'react';

// 1. Importa o componente que gere todas as rotas
import AppRoutes from './routes/AppRoutes';

// 2. Importa os provedores de contexto globais
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

/**
 * O componente raiz (root) da aplicação.
 *
 * A sua única responsabilidade é "embrulhar" (wrap)
 * toda a aplicação com os Provedores de Contexto globais.
 */
function App() {
  return (
    // O AuthProvider gere o 'user', 'token', 'login', 'logout'
    // e o estado 'isLoading' inicial.
    <AuthProvider>
      
      {/* O NotificationProvider gere os "toasts"
          (ex: "Salvo com sucesso!") e disponibiliza
          o hook 'useNotification'. */}
      <NotificationProvider>
        
        {/* O AppRoutes gere toda a lógica de routing
            (Layouts, ProtectedRoute, Páginas, etc.) */}
        <AppRoutes />

      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;