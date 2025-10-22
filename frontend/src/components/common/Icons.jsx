// src/components/common/Icons.jsx

/*
 * Centraliza todas as importações de ícones da biblioteca 'react-icons'.
 */

import React from 'react'; // Import React para componentes funcionais simples (opcional)

import {
  FiFile,
  FiUpload,
  FiDownload,
  FiUsers,
  FiBarChart2,
  FiMessageSquare,
  FiLogOut,
  FiEdit,
  FiEye,
  FiMenu,
  FiUser,
  FiBell,
  FiX,
  FiFolder,
  FiPrinter,
  FiSend,
  FiSearch,
  FiAlertTriangle,
  FiHome,
  FiPaperclip,
  FiChevronDown,
  FiCheck,
} from 'react-icons/fi'; // Feather Icons

import {
  HiOutlineBuildingOffice2,
  HiOutlineMegaphone,
} from 'react-icons/hi2'; // Heroicons

import { FaFileExcel } from 'react-icons/fa'; // Font Awesome

// Mapeamento dos nomes para os ícones da biblioteca
export const FileIcon = (props) => <FiFile {...props} />;
export const UploadIcon = (props) => <FiUpload {...props} />;
export const DownloadIcon = (props) => <FiDownload {...props} />;
export const UsersIcon = (props) => <FiUsers {...props} />;
export const BuildingIcon = (props) => <HiOutlineBuildingOffice2 {...props} />;
export const ChartIcon = (props) => <FiBarChart2 {...props} />;
export const MessageIcon = (props) => <FiMessageSquare {...props} />;
export const LogoutIcon = (props) => <FiLogOut {...props} />;
export const EditIcon = (props) => <FiEdit {...props} />;
export const ViewIcon = (props) => <FiEye {...props} />;
export const MenuIcon = (props) => <FiMenu {...props} />;
export const ProfileIcon = (props) => <FiUser {...props} />;
export const BellIcon = (props) => <FiBell {...props} />;
export const XIcon = (props) => <FiX {...props} />;
export const FolderIcon = (props) => <FiFolder {...props} />;
export const PrintIcon = (props) => <FiPrinter {...props} />;
export const SendIcon = (props) => <FiSend {...props} />;
export const SearchIcon = (props) => <FiSearch {...props} />;
export const AlertTriangleIcon = (props) => <FiAlertTriangle {...props} />;
export const MegaphoneIcon = (props) => <HiOutlineMegaphone {...props} />;
export const HomeIcon = (props) => <FiHome {...props} />;
export const ExcelIcon = (props) => <FaFileExcel {...props} />;

// Ícones bônus
export const AttachmentIcon = (props) => <FiPaperclip {...props} />;
export const ChevronDownIcon = (props) => <FiChevronDown {...props} />;
export const CheckIcon = (props) => <FiCheck {...props} />;

/*
 * --- Como Usar nos seus componentes ---
 *
 * import { FileIcon, EditIcon } from './Icons.jsx'; // Importa do ficheiro centralizado
 *
 * function MyComponent() {
 * return (
 * <button>
 * <EditIcon className="w-5 h-5 mr-2" /> // Usa como um componente normal
 * Editar
 * </button>
 * );
 * }
 */