import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as officeService from '../../services/officeService.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// --- Ícones Nativos ---
const PlusIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>;
const OfficeIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z"></path></svg>;
const EditIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

// --- Validação do Formulário ---
const schema = yup.object().shape({
  name: yup.string().required('O nome do escritório é obrigatório.'),
  email: yup.string().email('E-mail inválido.').nullable(),
  document: yup.string().nullable(),
  phone: yup.string().nullable(),
});

export default function ManageOffices() {
  const [offices, setOffices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState(null); // Guarda os dados do escritório que estamos a editar

  const addNotification = useNotification();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const fetchOffices = async () => {
    setIsLoading(true);
    try {
      const data = await officeService.getOffices();
      setOffices(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error("Erro ao buscar escritórios:", error);
      addNotification("Erro ao carregar a lista de escritórios.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  // --- Funções para Abrir Modal ---
  const handleOpenCreate = () => {
    setOfficeToEdit(null);
    reset(); // Limpa form
    setIsModalOpen(true);
  };

  const handleOpenEdit = (office) => {
    setOfficeToEdit(office);
    // Preenche o formulário com os dados do escritório selecionado
    setValue('name', office.name);
    setValue('document', office.document || '');
    setValue('email', office.email || '');
    setValue('phone', office.phone || '');
    setIsModalOpen(true);
  };

  // --- Funções de Ação (Submeter e Apagar) ---
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (officeToEdit) {
        // MODO EDIÇÃO
        await officeService.updateOffice(officeToEdit.id, data);
        addNotification(`Escritório "${data.name}" atualizado com sucesso!`, 'success');
      } else {
        // MODO CRIAÇÃO
        await officeService.createOffice(data);
        addNotification(`Escritório "${data.name}" criado com sucesso!`, 'success');
      }
      setIsModalOpen(false);
      fetchOffices(); // Recarrega a tabela
    } catch (error) {
      addNotification(error.response?.data?.message || 'Erro ao processar a solicitação.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (office) => {
    if (!window.confirm(`Tem a certeza que deseja excluir o escritório "${office.name}"?\nEsta ação não pode ser desfeita.`)) return;
    
    try {
      await officeService.deleteOffice(office.id);
      addNotification(`Escritório excluído com sucesso!`, 'success');
      fetchOffices();
    } catch (error) {
      addNotification(error.response?.data?.message || 'Erro ao excluir o escritório.', 'error');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <OfficeIcon /> Gestão de Escritórios (SaaS)
        </h1>
        <Button onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ea580c', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <PlusIcon /> Novo Escritório
        </Button>
      </div>

      {/* Tabela */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Spinner text="Carregando escritórios..." /></div>
        ) : offices.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Nenhum escritório cadastrado. Clique no botão acima para criar o primeiro!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Nome do Escritório</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Documento (CNPJ)</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Contatos</th>
                <th style={{ padding: '12px 16px', color: '#374151', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((office) => (
                <tr key={office.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>#{office.id}</td>
                  <td style={{ padding: '12px 16px', color: '#111827', fontSize: '15px', fontWeight: '500' }}>{office.name}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563', fontSize: '14px' }}>{office.document || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#4b5563', fontSize: '14px' }}>
                    <div>{office.email || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{office.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleOpenEdit(office)} style={{ padding: '6px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Editar Escritório">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(office)} style={{ padding: '6px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Excluir Escritório">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Reutilizável (Criar/Editar) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={officeToEdit ? "Editar Escritório" : "Cadastrar Novo Escritório"}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Nome do Escritório *</label>
            <input 
              {...register('name')} 
              placeholder="Ex: Flora Contabilidade" 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Documento (CNPJ)</label>
            <input 
              {...register('document')} 
              placeholder="Ex: 00.000.000/0000-00" 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>E-mail</label>
              <input 
                {...register('email')} 
                type="email"
                placeholder="contato@escritorio.com" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Telefone</label>
              <input 
                {...register('phone')} 
                placeholder="(00) 00000-0000" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit" style={{ backgroundColor: '#ea580c', color: '#fff' }} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (officeToEdit ? 'Atualizar Escritório' : 'Criar Escritório')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}