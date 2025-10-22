// src/pages/contador/Profile.js

import React, { useState } from 'react';
// Importa o hook para pegar os dados do usuário logado
import { useAuth } from '../../hooks/useAuth';
// Importa o hook para salvar na API
import { useApi } from '../../hooks/useApi';
// Importa o hook para notificações de sucesso
import { useNotification } from '../../contexts/NotificationContext';

// Importa componentes de UI
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

// (Import real da API no futuro)
// import * as userService from '../../services/userService';

// --- Função de API Simulada (Mock) ---
// Simula a API de atualização do perfil do usuário
const mockUpdateProfileApi = (userId, data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('API MOCK: Atualizando Perfil', userId, data);
      // Em uma API real, o backend retornaria o objeto do usuário atualizado
      // E o AuthContext deveria ser atualizado também.
      resolve({ data: { ...data, id: userId } });
    }, 1000); // 1 segundo de delay
  });
// --- Fim da Função de API Simulada ---

/**
 * Página de Perfil do Contador.
 *
 * Permite ao Contador editar suas próprias informações (nome, email, etc.).
 */
export default function ProfilePage() {
  // 1. Pega os dados do usuário logado do AuthContext
  const { user } = useAuth();
  const addNotification = useNotification();

  // 2. Estado do formulário, inicializado com os dados do usuário
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // (Você pode adicionar 'currentPassword', 'newPassword' aqui no futuro)
  });

  // 3. Conecta o hook 'useApi' com a função de salvar
  const {
    request: updateProfile,
    isLoading,
    error,
  } = useApi(mockUpdateProfileApi);

  // Handler genérico para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler para submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 4. Chama a API para salvar
      await updateProfile(user.id, formData);

      // 5. Sucesso!
      addNotification('Perfil salvo com sucesso!', 'success');
      
      // NOTA: Em uma aplicação real, você também precisaria
      // atualizar o 'user' no AuthContext após o salvamento,
      // para que o nome no Header (ex: "Olá, Carlos") mude.
      // ex: authContext.setUser(updatedUser);

    } catch (err) {
      // O hook 'useApi' já exibiu a notificação de erro.
      console.error('Falha ao salvar perfil:', err);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Editar Meu Perfil
      </h2>

      {/* O 'max-w-2xl' centraliza o formulário
          em um contêiner de tamanho médio */}
      <div className="mt-6 bg-white p-8 rounded-lg shadow-md max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome Completo"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            // Mostra o erro vindo da API (se houver e for deste campo)
            error={error?.data?.field === 'name' ? error.data.message : null}
          />

          <Input
            label="Endereço de E-mail"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={error?.data?.field === 'email' ? error.data.message : null}
          />

          {/* (Seção futura para mudança de senha) */}
          {/* <hr />
          <Input label="Senha Atual" id="currentPassword" type="password" />
          <Input label="Nova Senha" id="newPassword" type="password" />
          */}

          {/* --- Botões de Ação --- */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormData({ name: user.name, email: user.email })} // Reseta o form
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : null}
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}