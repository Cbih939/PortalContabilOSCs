// src/pages/NotFound.js

import React from 'react';
import { Link } from 'react-router-dom';
// Importa o nosso componente de Botão
import Button from '../components/common/Button';
// Importa o ícone de Home
import { HomeIcon } from '../components/common/Icons';

/**
 * Página 404 (Não Encontrado).
 *
 * Exibida quando o utilizador acede a uma rota
 * que não está definida no AppRoutes.
 */
export default function NotFoundPage() {
  return (
    // O 'p-8' garante que, mesmo dentro do AppLayout,
    // o conteúdo não fique colado ao topo.
    <div className="p-8">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center mx-auto">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-2">
          Página Não Encontrada
        </h2>
        <p className="text-gray-500 mb-8">
          Lamentamos, mas a página que procura não existe ou foi movida.
        </p>
        
        {/*
          O <Link> para "/" funciona para qualquer utilizador.
          - Se estiver deslogado, "/" redireciona para "/login".
          - Se estiver logado, "/" redireciona para o seu dashboard
            (ex: "/contador/dashboard").
          O ProtectedRoute tratará dessa lógica.
        */}
        <Button
          as={Link} // Faz o nosso Botão comportar-se como um <Link>
          to="/" // Link para a raiz
          variant="primary"
          className="inline-flex" // Garante que o botão não ocupe 100% da largura
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}

/**
 * --- Como Usar (no AppRoutes.js) ---
 *
 * import { Routes, Route } from 'react-router-dom';
 * import NotFoundPage from './pages/NotFound';
 *
 * // ...
 *
 * <Routes>
 * {/* ... (outras rotas de login, admin, contador, osc) ... */}
 *
 * {/* A Rota "Catch-All" (Coringa) */}
 * {/* O asterisco (*) captura qualquer rota que não
 * correspondeu às rotas acima. */}
 * <Route path="*" element={<NotFoundPage />} />
 * </Routes>
 *
 */