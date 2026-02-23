// src/components/common/Icons.jsx

/*
 * Centraliza todas as importações de ícones da biblioteca 'react-icons'.
 */

import React from 'react';

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
  FiTrash2, // Adicionado para exclusão
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
export const TrashIcon = (props) => <FiTrash2 {...props} />; // Exportação necessária para o build

// Ícones bônus
export const AttachmentIcon = (props) => <FiPaperclip {...props} />;
export const ChevronDownIcon = (props) => <FiChevronDown {...props} />;
export const CheckIcon = (props) => <FiCheck {...props} />;

// Ícone de Olho Customizado (SVG Direto)
export const EyeIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
    style={{ width: '20px', height: '20px' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);