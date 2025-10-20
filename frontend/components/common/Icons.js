// src/components/common/Icons.js

/*
 * Este arquivo centraliza todas as importações de ícones da biblioteca 'react-icons'.
 * Isso nos permite trocar facilmente um ícone em toda a aplicação
 * apenas modificando a exportação neste arquivo.
 */

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
  FiPaperclip, // Ícone de Anexo (Bônus)
  FiChevronDown, // Ícone de Seta (Bônus)
  FiCheck, // Ícone de Sucesso (Bônus)
} from 'react-icons/fi'; // Feather Icons (fi) - Excelente para UI minimalista

import {
  HiOutlineOfficeBuilding, // Ícone de Prédio/OSC
  HiOutlineMegaphone, // Ícone de Megafone/Avisos
} from 'react-icons/hi2'; // Heroicons (hi) - Também ótimo para Tailwind

import { FaFileExcel } from 'react-icons/fa'; // Font Awesome (fa) - Para ícones específicos

// Mapeamento dos nomes do protótipo para os ícones da biblioteca
export const FileIcon = FiFile;
export const UploadIcon = FiUpload;
export const DownloadIcon = FiDownload;
export const UsersIcon = FiUsers;
export const BuildingIcon = HiOutlineOfficeBuilding;
export const ChartIcon = FiBarChart2;
export const MessageIcon = FiMessageSquare;
export const LogoutIcon = FiLogOut;
export const EditIcon = FiEdit;
export const ViewIcon = FiEye;
export const MenuIcon = FiMenu;
export const ProfileIcon = FiUser;
export const BellIcon = FiBell;
export const XIcon = FiX;
export const FolderIcon = FiFolder;
export const PrintIcon = FiPrinter;
export const SendIcon = FiSend;
export const SearchIcon = FiSearch;
export const AlertTriangleIcon = FiAlertTriangle;
export const MegaphoneIcon = HiOutlineMegaphone;
export const HomeIcon = FiHome;
export const ExcelIcon = FaFileExcel;

// Ícones bônus que provavelmente usaremos
export const AttachmentIcon = FiPaperclip;
export const ChevronDownIcon = FiChevronDown;
export const CheckIcon = FiCheck;

/*
 * --- Como Usar nos seus componentes ---
 *
 * import { FileIcon, EditIcon } from '../common/Icons';
 *
 * function MyComponent() {
 * return (
 * <button>
 * <EditIcon className="w-5 h-5 mr-2" />
 * Editar
 * </button>
 * );
 * }
 */