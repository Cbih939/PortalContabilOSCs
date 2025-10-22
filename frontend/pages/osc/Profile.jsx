// src/pages/osc/Profile.js

import React, { useState, useEffect } from 'react';
// Importa os hooks
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';

// Importa os dados mockados (no futuro, virá da API)
import { mockOSCs } from '../../utils/mockData';

// Importa os componentes de UI
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

// (Import real da API no futuro)
// import * as oscService from '../../services/oscService';

// --- Função de API Simulada (Mock) ---
// Simula a API de atualização do perfil da OSC
const mockUpdateProfileApi = (id, data) =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('API MOCK: Atualizando Perfil da OSC', id, data);
      resolve({ data }); // Retorna os dados atualizados
    }, 1000); // 1 segundo de delay
  });
// --- Fim da Função de API Simulada ---

/**
 * Página de Perfil da OSC.
 *
 * Permite à OSC visualizar e editar as suas próprias
 * informações de registo (nome, CNPJ, responsável, etc.).
 */
export default function OSCProfilePage() {
  // 1. Pega os dados do utilizador logado
  const { user } = useAuth();
  const addNotification = useNotification();

  // 2. Estados
  const [formData, setFormData] = useState(null); // Armazena os dados do perfil
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 3. Conecta o hook 'useApi' com a função de salvar
  const {
    request: updateProfile,
    isLoading: isSaving, // Renomeia para 'isSaving'
  } = useApi(mockUpdateProfileApi);

  // 4. Efeito para Buscar os Dados Completos do Perfil (Simulação)
  useEffect(() => {
    setIsLoadingData(true);
    // Simula uma chamada de API para buscar os detalhes da OSC
    setTimeout(() => {
      const oscDetails = mockOSCs.find((o) => o.id === user?.id);
      if (oscDetails) {
        setFormData(oscDetails);
      }
      setIsLoadingData(false);
    }, 300); // 300ms de delay
  }, [user?.id]); // Depende do 'user.id'

  // 5. Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // 1. Chama a API
      const updatedData = await updateProfile(formData.id, formData);

      // 2. Sucesso!
      addNotification('Perfil salvo com sucesso!', 'success');
      
      // 3. Atualiza o estado local e sai do modo de edição
      setFormData(updatedData); // Atualiza o 'formData' com a resposta da API
      setIsEditing(false);
      
      // NOTA: Se o 'nome' da OSC for alterado, o 'user' no
      // AuthContext também precisará de ser atualizado.

    } catch (err) {
      // O hook 'useApi' já mostrou a notificação de erro.
      console.error('Falha ao salvar perfil:', err);
    }
  };

  const handleCancel = () => {
    // Reverte quaisquer alterações, buscando os dados originais do mock
    const oscDetails = mockOSCs.find((o) => o.id === user?.id);
    setFormData(oscDetails);
    setIsEditing(false);
  };

  // --- Renderização ---

  // Exibe um spinner enquanto os dados iniciais carregam
  if (isLoadingData) {
    return (
      <div className="p-8">
        <Spinner fullscreen text="A carregar perfil..." />
      </div>
    );
  }

  // Se, por algum motivo, não encontrar os dados
  if (!formData) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro: Não foi possível carregar os dados do perfil.
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Container centralizado (do protótipo) */}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        
        {/* --- Cabeçalho (Título e Botão de Editar) --- */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-700">Meu Perfil</h2>
          {!isEditing && (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </Button>
          )}
        </div>

        {/* Alterna entre Modo de Visualização e Modo de Edição */}
        {!isEditing ? (
          
          // --- MODO DE VISUALIZAÇÃO ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-gray-700">
            <div>
              <strong className="text-gray-500 text-sm">Nome da OSC</strong>
              <p>{formData.name}</p>
            </div>
            <div>
              <strong className="text-gray-500 text-sm">CNPJ</strong>
              <p>{formData.cnpj}</p>
            </div>
            <div>
              <strong className="text-gray-500 text-sm">Responsável</strong>
              <p>{formData.responsible}</p>
            </div>
            <div>
              <strong className="text-gray-500 text-sm">Email</strong>
              <p>{formData.email}</p>
            </div>
            <div>
              <strong className="text-gray-500 text-sm">Telefone</strong>
              <p>{formData.phone}</p>
            </div>
            <div className="md:col-span-2">
              <strong className="text-gray-500 text-sm">Endereço</strong>
              <p>{formData.address}</p>
            </div>
          </div>
          
        ) : (

          // --- MODO DE EDIÇÃO (Formulário) ---
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome da OSC"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="CNPJ"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                required
              />
              <Input
                label="Responsável"
                id="responsible"
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
              />
              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Telefone"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <Input
                  label="Endereço"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Botões de Ação do Formulário */}
            <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : null}
                {isSaving ? 'A guardar...' : 'Guardar Alterações'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}