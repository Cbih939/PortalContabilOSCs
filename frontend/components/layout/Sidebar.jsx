// src/components/layout/Sidebar.js

import React from 'react';
import { clsx } from 'clsx';

/**
 * Um 'molde' de Sidebar genérico e reutilizável.
 *
 * Controla a exibição (aberto/fechado) e o estilo base (fundo escuro,
 * transição de largura). O conteúdo (logo, links e rodapé) é
 * passado via props.
 *
 * Props:
 * - isOpen (boolean): Controla se a sidebar está visível ou não.
 * - logo (ReactNode): O conteúdo do topo (ex: Título/Logo).
 * - children (ReactNode): O conteúdo principal (os links de navegação).
 * - footer (ReactNode): O conteúdo do rodapé (ex: Botão de Sair).
 * - className (string): Classes CSS adicionais para o <aside> (ex: 'bg-gray-800' ou 'bg-gray-900').
 */
export default function Sidebar({
  isOpen,
  logo,
  children,
  footer,
  className = 'bg-gray-800', // Padrão 'Contador' (cinza escuro)
}) {
  return (
    <aside
      className={clsx(
        'text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0',
        isOpen ? 'w-64' : 'w-0', // Controla a largura
        className // Permite trocar a cor (ex: 'bg-gray-900' para Admin)
      )}
    >
      {/* O contêiner interno 'overflow-hidden' é crucial para impedir
        que o texto (ex: "Lista de OSCs") apareça enquanto a sidebar
        está se fechando (quando w-0).
      */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* --- Logo --- */}
        <div className="p-6 border-b border-gray-700 whitespace-nowrap">
          {logo}
        </div>

        {/* --- Links de Navegação (Conteúdo Principal) --- */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {children}
        </nav>

        {/* --- Rodapé (Logout) --- */}
        <div className="p-4 border-t border-gray-700 whitespace-nowrap">
          {footer}
        </div>
      </div>
    </aside>
  );
}

/**
 * --- Como Usar (Exemplo de um 'ContadorSidebar.js') ---
 *
 * import React from 'react';
 * import { NavLink } from 'react-router-dom'; // Importante para links ativos
 * import Sidebar from '../../../components/layout/Sidebar';
 * import { BuildingIcon, FolderIcon, LogoutIcon } from '../../../components/common/Icons';
 * // import useAuth from '../../../hooks/useAuth';
 *
 * // Componente de link reutilizável para a sidebar
 * const SidebarLink = ({ to, icon: Icon, children }) => {
 * return (
 * <NavLink
 * to={to}
 * className={({ isActive }) =>
 * clsx(
 * 'w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-700 whitespace-nowrap',
 * isActive ? 'bg-blue-600' : ''
 * )
 * }
 * >
 * <Icon className="h-5 w-5" />
 * <span className="ml-3">{children}</span>
 * </NavLink>
 * );
 * };
 *
 * export default function ContadorSidebar({ isOpen }) {
 * // const { logout } = useAuth(); // Você usará isso
 * const handleLogout = () => alert("Saindo...");
 *
 * const logo = <h2 className="text-2xl font-bold">Contábil OSC</h2>;
 *
 * const footer = (
 * <button
 * onClick={handleLogout}
 * className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-700"
 * >
 * <LogoutIcon className="h-5 w-5" />
 * <span className="ml-3 whitespace-nowrap">Sair</span>
 * </button>
 * );
 *
 * return (
 * <Sidebar isOpen={isOpen} logo={logo} footer={footer} className="bg-gray-800">
 * {/* Links de navegação passados como 'children' */}
 * <SidebarLink to="/contador/oscs" icon={BuildingIcon}>
 * Lista de OSCs
 * </sSidebarLink>
 * <SidebarLink to="/contador/documentos" icon={FolderIcon}>
 * Documentos
 * </sSidebarLink>
 * {/* ...outros links... */}
 * </Sidebar>
 * );
 * }
 */