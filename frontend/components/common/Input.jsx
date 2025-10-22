// src/components/common/Input.js

import React from 'react';
import { clsx } from 'clsx';

/**
 * Componente de Input reutilizável com suporte a label, ícone e erro.
 *
 * Props:
 * - label: O texto para o <label> (opcional).
 * - id: O 'id' do input (necessário para o 'htmlFor' do label).
 * - name: O 'name' do input.
 * - icon: Um componente de ícone para renderizar à esquerda (opcional).
 * - error: Uma string de mensagem de erro (opcional).
 * - className: Classes CSS para o *contêiner* principal (opcional).
 * - inputClassName: Classes CSS para o *elemento <input>* (opcional).
 * - ...props: Outras props do <input> (type, value, onChange, placeholder, disabled, etc).
 */
export default function Input({
  label,
  id,
  name,
  icon: IconComponent, // Renomeia a prop 'icon' para 'IconComponent' para usar como JSX
  error,
  className,
  inputClassName,
  ...props
}) {
  // --- Estilos Base ---
  const baseInputStyles =
    'block w-full p-3 border rounded-lg shadow-sm text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';

  // --- Estilos Condicionais ---
  const errorStyles = error
    ? 'border-red-500 focus:ring-red-500' // Borda de erro
    : 'border-gray-300 focus:ring-blue-500'; // Borda padrão

  // Adiciona padding à esquerda se houver um ícone
  const iconPaddingStyles = IconComponent ? 'pl-10' : 'pl-3';

  return (
    <div className={clsx('w-full', className)}>
      {/* --- Label --- */}
      {label && (
        <label
          htmlFor={id || name} // Usa 'id' ou 'name' para o 'for'
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* --- Contêiner do Input (para posicionar o ícone) --- */}
      <div className="relative">
        {/* --- Ícone (se existir) --- */}
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconComponent className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* --- O Input --- */}
        <input
          id={id}
          name={name}
          className={clsx(
            baseInputStyles,
            errorStyles,
            iconPaddingStyles,
            inputClassName
          )}
          {...props} // Passa o resto das props (value, onChange, type, placeholder, etc)
        />
      </div>

      {/* --- Mensagem de Erro --- */}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id || name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * --- Como Usar ---
 *
 * import Input from './Input';
 * import { SearchIcon, ProfileIcon } from '../common/Icons';
 *
 * // Input simples
 * <Input
 * type="text"
 * placeholder="Digite seu nome..."
 * value={name}
 * onChange={(e) => setName(e.target.value)}
 * />
 *
 * // Input com Label e ID (para acessibilidade)
 * <Input
 * label="Email"
 * id="email"
 * name="email"
 * type="email"
 * placeholder="voce@email.com"
 * />
 *
 * // Input de Busca com Ícone
 * <Input
 * icon={SearchIcon}
 * type="text"
 * placeholder="Buscar OSC..."
 * />
 *
 * // Input com Erro
 * <Input
 * label="Senha"
 * id="password"
 * type="password"
 * error="A senha deve ter no mínimo 8 caracteres."
 * />
 *
 * // Input Desabilitado
 * <Input
 * label="CNPJ"
 * id="cnpj"
 * value="12.345.678/0001-99"
 * disabled
 * />
 */