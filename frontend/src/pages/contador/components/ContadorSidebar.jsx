// src/pages/contador/components/ContadorSidebar.jsx

import React from 'react'; // Removido useState daqui, pois é gerido pelo Wrapper
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
// Importa o molde genérico
import Sidebar from '../../../components/layout/Sidebar.jsx';
// Importa ícones e o hook de autenticação
import {
  BuildingIcon,
  FolderIcon,
  ChartIcon,
  MegaphoneIcon,
  MessageIcon,
  ProfileIcon,
  LogoutIcon,
} from '../../../components/common/Icons.jsx';
import { useAuth } from '../../../hooks/useAuth.jsx';

// Componente auxiliar reutilizável para os links da Sidebar
const SidebarLink = ({ to, icon: Icon, children }) => {
  return (
    <NavLink
      to={to}
      // NavLink passa 'isActive' para a função className
      className={({ isActive }) =>
        clsx(
          'w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-700 whitespace-nowrap transition-colors duration-200',
          isActive ? 'bg-blue-600 font-semibold' : '' // Estilo ativo
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3">{children}</span>
    </NavLink>
  );
};


/**
 * Componente Sidebar específico para o painel do Contador.
 */
export default function ContadorSidebar({ isOpen }) { // Recebe isOpen do ContadorLayoutWrapper
  const { logout } = useAuth(); // Pega a função de logout

  const handleLogout = () => {
    logout();
  };

  // Define o logo/título
  const logo = <h2 className="text-2xl font-bold">Contábil OSC</h2>;

  // Define o rodapé com o botão de logout
  const footer = (
    <button
      onClick={handleLogout}
      className="w-full text-left flex items-center p-3 rounded-lg hover:bg-red-700 hover:text-white transition-colors duration-200 text-gray-300"
    >
      <LogoutIcon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap">Sair</span>
    </button>
  );

  return (
    // Renderiza o "molde" Sidebar
    <Sidebar isOpen={isOpen} logo={logo} footer={footer} className="bg-gray-800">
      {/* Links de Navegação (passados como children) */}
      <SidebarLink to="/contador/dashboard" icon={ChartIcon}>
        Dashboard
      </SidebarLink>
      <SidebarLink to="/contador/oscs" icon={BuildingIcon}>
        Lista de OSCs
      </SidebarLink>
      <SidebarLink to="/contador/documentos" icon={FolderIcon}>
        Documentos
      </SidebarLink>
      <SidebarLink to="/contador/avisos" icon={MegaphoneIcon}>
        Canal de Avisos
      </SidebarLink>
      <SidebarLink to="/contador/mensagens" icon={MessageIcon}>
        Mensagens
      </SidebarLink>
      <SidebarLink to="/contador/perfil" icon={ProfileIcon}>
        Editar Perfil
      </SidebarLink>
    </Sidebar>
  );
}