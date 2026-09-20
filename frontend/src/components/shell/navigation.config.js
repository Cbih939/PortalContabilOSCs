// Fonte única da navegação. Sidebar (desktop), barra inferior e folha "Mais" (mobile/tablet)
// leem daqui, então o menu nunca diverge entre dispositivos.
import {
  FiHome, FiFileText, FiMessageSquare, FiUser, FiGrid, FiBriefcase, FiDollarSign,
  FiUsers, FiBookOpen, FiBell, FiShield, FiBarChart2, FiHelpCircle, FiFolder,
  FiClipboard, FiCreditCard, FiLayers, FiActivity, FiUploadCloud, FiAward, FiTag,
} from 'react-icons/fi';
import { ROLES, normalizeRole } from '../../utils/constants.js';

const GUIDE = { key: 'guia', to: '/manual', label: 'Guia do App', icon: FiHelpCircle, external: true };

/**
 * @returns {{
 *   primary: Array,   // itens da barra inferior (o CTA central, se houver, fica em `cta`)
 *   cta: object|null, // ação principal (ex.: Enviar documento)
 *   more: Array,      // demais itens (folha "Mais" no mobile / restante da sidebar)
 *   roleLabel: string
 * }}
 */
export function getNavigation(user, isOfficeAdmin = false) {
  const role = normalizeRole(user?.role);

  if (role === ROLES.ADMIN) {
    return {
      roleLabel: 'Administrador',
      cta: null,
      primary: [
        { key: 'inicio', to: '/admin/dashboard', label: 'Início', icon: FiHome, tour: 'nav-home' },
        { key: 'escritorios', to: '/admin/offices', label: 'Escritórios', icon: FiBriefcase },
        { key: 'oscs', to: '/admin/oscs', label: 'OSCs', icon: FiGrid },
        { key: 'financeiro', to: '/admin/financeiro', label: 'Financeiro', icon: FiDollarSign, tour: 'nav-finance' },
      ],
      more: [
        { key: 'usuarios', to: '/admin/usuarios', label: 'Usuários', icon: FiUsers },
        { key: 'biblioteca', to: '/admin/biblioteca', label: 'Biblioteca', icon: FiBookOpen },
        { key: 'planos', to: '/admin/planos', label: 'Planos e Preços', icon: FiTag },
        { key: 'avisos', to: '/admin/avisos', label: 'Avisos Globais', icon: FiBell },
        { key: 'auditoria', to: '/admin/relatorios', label: 'Auditoria e Logs', icon: FiActivity, tour: 'nav-reports' },
        { key: 'perfil', to: '/admin/profile', label: 'Meu Perfil', icon: FiUser },
        GUIDE,
      ],
    };
  }

  if (role === ROLES.CONTADOR) {
    const more = [
      { key: 'modelos', to: '/contador/modelos', label: 'Documentos e Modelos', icon: FiLayers },
      { key: 'certificadoras', to: '/contador/certificadoras', label: 'Certificadoras', icon: FiShield },
      { key: 'avisos', to: '/contador/avisos', label: 'Avisos Gerais', icon: FiBell },
      { key: 'relatorios', to: '/contador/relatorios', label: 'Relatórios do Sistema', icon: FiBarChart2, tour: 'nav-reports' },
    ];
    if (isOfficeAdmin) {
      more.push(
        { key: 'equipe', to: '/contador/equipe', label: 'Equipe do Escritório', icon: FiUsers },
        { key: 'financeiro', to: '/contador/financeiro', label: 'Financeiro', icon: FiDollarSign, tour: 'nav-finance' },
      );
    }
    more.push({ key: 'perfil', to: '/contador/perfil', label: 'Meu Perfil', icon: FiUser }, GUIDE);

    return {
      roleLabel: isOfficeAdmin ? 'ADM Contador' : 'Contador',
      cta: null,
      primary: [
        { key: 'inicio', to: '/contador/dashboard', label: 'Início', icon: FiHome, tour: 'nav-home' },
        { key: 'oscs', to: '/contador/oscs', label: 'OSCs', icon: FiGrid },
        { key: 'documentos', to: '/contador/documentos', label: 'Documentos', icon: FiFileText, tour: 'nav-docs' },
        { key: 'mensagens', to: '/contador/mensagens', label: 'Mensagens', icon: FiMessageSquare },
      ],
      more,
    };
  }

  // OSC — interface propositalmente enxuta: o essencial fica na barra; o resto em "Mais".
  return {
    roleLabel: 'OSC',
    cta: { key: 'enviar', to: '/osc/documentos?enviar=1', label: 'Enviar documento', icon: FiUploadCloud, tour: 'upload-cta' },
    primary: [
      { key: 'inicio', to: '/osc/inicio', label: 'Início', icon: FiHome, tour: 'nav-home' },
      { key: 'documentos', to: '/osc/documentos', label: 'Documentos', icon: FiFileText, tour: 'nav-docs' },
      { key: 'mensagens', to: '/osc/mensagens', label: 'Mensagens', icon: FiMessageSquare },
    ],
    more: [
      { key: 'modelos', to: '/osc/modelos', label: 'Modelos de Documentos', icon: FiLayers },
      { key: 'biblioteca', to: '/osc/biblioteca', label: 'Biblioteca', icon: FiBookOpen },
      { key: 'projetos', to: '/osc/projetos', label: 'Projetos', icon: FiFolder },
      { key: 'governanca', to: '/osc/governanca', label: 'Governança e Diretoria', icon: FiAward },
      { key: 'prestacao', to: '/osc/prestacao-contas', label: 'Prestação de Contas', icon: FiClipboard },
      { key: 'assinatura', to: '/osc/financeiro', label: 'Faturas e Assinatura', icon: FiCreditCard },
      { key: 'perfil', to: '/osc/perfil', label: 'Minha Organização', icon: FiUser },
      { key: 'ajuda', to: '/osc/ajuda', label: 'Ajuda Institucional', icon: FiHelpCircle },
      GUIDE,
    ],
  };
}
