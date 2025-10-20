// src/components/layout/Header.js

import React from 'react';

/**
 * Um 'molde' de cabeçalho genérico e reutilizável.
 *
 * Ele apenas fornece o contêiner branco com sombra e a divisão
 * "conteúdo à esquerda" vs "conteúdo à direita" usando flexbox.
 *
 * Props:
 * - leftContent (ReactNode): Conteúdo para o lado esquerdo (ex: Título ou Botão de Menu).
 * - rightContent (ReactNode): Conteúdo para o lado direito (ex: Ícones, Menu do Usuário).
 */
export default function Header({ leftContent, rightContent }) {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
      {/* --- Lado Esquerdo --- */}
      {/* Contêiner para o botão de menu (Contador/Admin) ou Título (OSC) */}
      <div className="flex items-center">
        {leftContent}
      </div>

      {/* --- Lado Direito --- */}
      {/* Contêiner para ícones de notificação, nome do usuário, etc. */}
      <div className="flex items-center space-x-4">
        {rightContent}
      </div>
    </header>
  );
}

/**
 * --- Como Usar ---
 *
 * Este componente é o 'molde'. Você vai criar os cabeçalhos
 * específicos para cada painel (Contador, OSC) usando ele,
 * provavelmente dentro da pasta de cada 'page' (ex: 'src/pages/contador/components/ContadorHeader.js').
 *
 *
 * --- Exemplo de um 'ContadorHeader.js' (Cabeçalho do Contador) ---
 *
 * import React from 'react';
 * import Header from '../../../components/layout/Header'; // Importa o molde
 * import { MenuIcon, BellIcon } from '../../../components/common/Icons';
 * // import useAuth from '../../../hooks/useAuth';
 *
 * export default function ContadorHeader({ onToggleSidebar }) {
 * // const { user } = useAuth(); // Você usará isso no futuro
 * const userName = "Carlos Contador"; // Placeholder
 *
 * const left = (
 * <button onClick={onToggleSidebar} className="text-gray-600 hover:text-gray-800">
 * <MenuIcon className="h-6 w-6" />
 * </button>
 * );
 *
 * const right = (
 * <>
 * <button className="relative text-gray-600 hover:text-gray-800">
 * <BellIcon className="h-6 w-6" />
 * {/* Badge de notificação */}
 * <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
 * </button>
 * <span className="text-gray-600 hidden sm:block">Olá, {userName}</span>
 * </>
 * );
 *
 * return <Header leftContent={left} rightContent={right} />;
 * }
 *
 *
 * --- Exemplo de um 'OSCHeader.js' (Cabeçalho da OSC) ---
 *
 * import React from 'react';
 * import Header from '../../../components/layout/Header'; // Importa o molde
 * import { AlertTriangleIcon } from '../../../components/common/Icons';
 * import Button from '../../../components/common/Button';
 * // import useAuth from '../../../hooks/useAuth';
 *
 * export default function OSCHeader() {
 * // const { user, logout } = useAuth(); // Você usará isso
 * const userName = "OSC Esperança"; // Placeholder
 * const handleLogout = () => alert("Saindo...");
 *
 * const left = (
 * <h1 className="text-2xl font-bold text-gray-800">Portal da OSC</h1>
 * );
 *
 * const right = (
 * <>
 * <button className="relative text-gray-600 hover:text-yellow-600">
 * <AlertTriangleIcon className="h-6 w-6" />
 * {/* Badge de alerta */}
 * <span className="absolute -top-2 -right-2 flex h-5 w-5 ...">1</span>
 * </button>
 * <span className="text-gray-600 hidden sm:block">Bem-vindo(a), {userName}</span>
 * <Button variant="danger" size="sm" onClick={handleLogout}>Sair</Button>
 * </>
 * );
 *
 * return <Header leftContent={left} rightContent={right} />;
 * }
 */