// src/pages/osc/Projects.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// --- Ícones ---
const FolderIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const PlusIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CalendarIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// Validação do Formulário
const schema = yup.object().shape({
  name: yup.string().required('O nome do projeto é obrigatório.'),
  description: yup.string().nullable(),
  start_date: yup.string().nullable(),
  end_date: yup.string().nullable(),
  status: yup.string().required('O status é obrigatório.')
});

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  const addNotification = useNotification();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'ATIVO' }
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data || []);
    } catch (error) {
      addNotification("Erro ao carregar projetos.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setProjectToEdit(null);
    reset({ name: '', description: '', start_date: '', end_date: '', status: 'ATIVO' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setProjectToEdit(project);
    setValue('name', project.name);
    setValue('description', project.description || '');
    setValue('start_date', project.start_date ? project.start_date.split('T')[0] : '');
    setValue('end_date', project.end_date ? project.end_date.split('T')[0] : '');
    setValue('status', project.status);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Se a data vier vazia, enviamos null para o banco de dados
      const payload = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null
      };

      if (projectToEdit) {
        await api.put(`/projects/${projectToEdit.id}`, payload);
        addNotification(`Projeto atualizado com sucesso!`, 'success');
      } else {
        await api.post('/projects', payload);
        addNotification(`Projeto criado com sucesso!`, 'success');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      addNotification("Erro ao salvar o projeto.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Tem a certeza que deseja excluir o projeto "${project.name}"?\nEsta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      addNotification(`Projeto excluído com sucesso!`, 'success');
      fetchProjects();
    } catch (error) {
      addNotification("Erro ao excluir o projeto.", "error");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ATIVO': return { bg: '#ecfdf5', color: '#059669', border: '#6ee7b7', label: 'Em Andamento' };
      case 'CONCLUIDO': return { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd', label: 'Concluído' };
      case 'SUSPENSO': return { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', label: 'Suspenso / Cancelado' };
      default: return { bg: '#f3f4f6', color: '#4b5563', border: '#d1d5db', label: status };
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px 0' }}>
            <div style={{ padding: '8px', backgroundColor: '#ffedd5', color: '#ea580c', borderRadius: '8px' }}><FolderIcon /></div>
            Projetos e Centros de Custo
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Não misture recurso livre com vinculado. Cadastre seus projetos para separar despesas e facilitar a prestação de contas.
          </p>
        </div>
        <Button onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ea580c', color: '#fff' }}>
          <PlusIcon /> Novo Projeto
        </Button>
      </div>

      {/* Grelha de Projetos */}
      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}><Spinner text="A carregar projetos..." /></div>
      ) : projects.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
          <FolderIcon style={{ width: '48px', height: '48px', color: '#9ca3af', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: '#374151', margin: '0 0 8px 0' }}>Nenhum projeto cadastrado</h3>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '14px' }}>Crie o seu primeiro projeto ou centro de custo para iniciar a organização financeira.</p>
          <Button onClick={handleOpenCreate} style={{ backgroundColor: '#ea580c', color: '#fff' }}>Criar Primeiro Projeto</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map((project) => {
            const statusStyle = getStatusStyle(project.status);
            return (
              <div key={project.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' } }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {statusStyle.label}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenEdit(project)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Editar"><EditIcon /></button>
                    <button onClick={() => handleDelete(project)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }} title="Excluir"><TrashIcon /></button>
                  </div>
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1f2937', fontWeight: 'bold' }}>{project.name}</h3>
                
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6b7280', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description || 'Sem descrição detalhada.'}
                </p>

                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '12px' }}>
                    <CalendarIcon /> 
                    <span>Início: <strong style={{color: '#1f2937'}}>{project.start_date ? new Date(project.start_date).toLocaleDateString('pt-BR') : '-'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '12px' }}>
                    <CalendarIcon /> 
                    <span>Fim: <strong style={{color: '#1f2937'}}>{project.end_date ? new Date(project.end_date).toLocaleDateString('pt-BR') : '-'}</strong></span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={projectToEdit ? "Editar Projeto" : "Novo Projeto / Centro de Custo"}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
          
          <div>
            <label style={labelStyle}>Nome do Projeto / Centro de Custo *</label>
            <input {...register('name')} placeholder="Ex: Fundo Municipal do Idoso 2026" style={inputStyle} />
            {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
          </div>

          <div>
            <label style={labelStyle}>Descrição (Opcional)</label>
            <textarea {...register('description')} rows="3" placeholder="Breve resumo do objetivo deste projeto..." style={{...inputStyle, resize: 'vertical'}} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Data de Início</label>
              <input type="date" {...register('start_date')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data de Conclusão</label>
              <input type="date" {...register('end_date')} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Situação do Projeto</label>
            <select {...register('status')} style={inputStyle}>
              <option value="ATIVO">Em Andamento (Ativo)</option>
              <option value="CONCLUIDO">Concluído / Prestação de Contas Entregue</option>
              <option value="SUSPENSO">Suspenso / Cancelado</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit" style={{ backgroundColor: '#ea580c', color: '#fff' }} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (projectToEdit ? 'Atualizar Projeto' : 'Criar Projeto')}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' };