// src/pages/osc/Governance.jsx

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// --- Ícones ---
const ShieldIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const PlusIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UserIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

// Validação do Formulário
const schema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório.'),
  role: yup.string().required('O cargo é obrigatório.'),
  cpf: yup.string().nullable(),
  start_date: yup.string().nullable(),
  end_date: yup.string().nullable(),
  status: yup.string().required('O status é obrigatório.')
});

export default function GovernancePage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const addNotification = useNotification();
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { status: 'ATIVO', role: 'Presidente' }
  });

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // 💡 DESVIO: Rota alterada para /diretoria
      const response = await api.get('/board');
      setMembers(response.data || []);
    } catch (error) {
      addNotification("Erro ao carregar diretoria.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenCreate = () => {
    setMemberToEdit(null);
    reset({ name: '', role: 'Presidente', cpf: '', start_date: '', end_date: '', status: 'ATIVO' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setMemberToEdit(member);
    setValue('name', member.name);
    setValue('role', member.role);
    setValue('cpf', member.cpf || '');
    setValue('start_date', member.start_date ? member.start_date.split('T')[0] : '');
    setValue('end_date', member.end_date ? member.end_date.split('T')[0] : '');
    setValue('status', member.status);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null
      };

      if (memberToEdit) {
        // 💡 DESVIO: Rota alterada para /diretoria
        await api.put(`/diretoria/${memberToEdit.id}`, payload);
        addNotification(`Membro atualizado com sucesso!`, 'success');
      } else {
        // 💡 DESVIO: Rota alterada para /diretoria
        await api.post('/diretoria', payload);
        addNotification(`Membro adicionado à diretoria!`, 'success');
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (error) {
      addNotification("Erro ao salvar os dados.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Tem certeza que deseja remover ${member.name} da diretoria?`)) return;
    try {
      // 💡 DESVIO: Rota alterada para /diretoria
      await api.delete(`/diretoria/${member.id}`);
      addNotification(`Membro removido com sucesso!`, 'success');
      fetchMembers();
    } catch (error) {
      addNotification("Erro ao remover membro.", "error");
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px 0' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '8px' }}><ShieldIcon /></div>
            Governança e Diretoria
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Mantenha o quadro da diretoria atualizado para garantir a regularidade bancária e jurídica da organização.
          </p>
        </div>
        <Button onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16a34a', color: '#fff' }}>
          <PlusIcon /> Adicionar Membro
        </Button>
      </div>

      {/* Tabela de Membros */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}><Spinner text="A carregar diretoria..." /></div>
        ) : members.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <UserIcon style={{ width: '48px', height: '48px', color: '#9ca3af', marginBottom: '16px', display: 'inline-block' }} />
            <h3 style={{ fontSize: '18px', color: '#374151', margin: '0 0 8px 0' }}>Nenhum membro cadastrado</h3>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '14px' }}>Adicione os membros da diretoria atual (Presidente, Tesoureiro, etc).</p>
            <Button onClick={handleOpenCreate} style={{ backgroundColor: '#16a34a', color: '#fff' }}>Adicionar Primeiro Membro</Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={thStyle}>Nome Completo</th>
                  <th style={thStyle}>Cargo</th>
                  <th style={thStyle}>Mandato</th>
                  <th style={thStyle}>Status</th>
                  <th style={{...thStyle, textAlign: 'right'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{member.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>CPF: {member.cpf || 'Não informado'}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                        {member.role}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '13px', color: '#4b5563' }}>
                        Início: {member.start_date ? new Date(member.start_date).toLocaleDateString('pt-BR') : '-'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4b5563' }}>
                        Fim: <strong style={{color: '#1f2937'}}>{member.end_date ? new Date(member.end_date).toLocaleDateString('pt-BR') : '-'}</strong>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {member.status === 'ATIVO' ? (
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>ATIVO</span>
                      ) : (
                        <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>INATIVO / EX-MEMBRO</span>
                      )}
                    </td>
                    <td style={{...tdStyle, textAlign: 'right'}}>
                      <button onClick={() => handleOpenEdit(member)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px', marginRight: '4px' }} title="Editar"><EditIcon /></button>
                      <button onClick={() => handleDelete(member)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }} title="Remover"><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Membro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={memberToEdit ? "Editar Membro" : "Adicionar Membro da Diretoria"}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
          
          <div>
            <label style={labelStyle}>Nome Completo *</label>
            <input {...register('name')} placeholder="Ex: João da Silva" style={inputStyle} />
            {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Cargo na Diretoria *</label>
              <select {...register('role')} style={inputStyle}>
                <option value="Presidente">Presidente</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="Tesoureiro">Tesoureiro(a)</option>
                <option value="Secretário">Secretário(a)</option>
                <option value="Conselheiro Fiscal">Conselheiro(a) Fiscal</option>
                <option value="Vogal">Vogal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>CPF</label>
              <Controller name="cpf" control={control} render={({ field }) => (
                <IMaskInput {...field} mask="000.000.000-00" style={inputStyle} placeholder="000.000.000-00" />
              )} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Início do Mandato</label>
              <input type="date" {...register('start_date')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fim do Mandato (Previsão)</label>
              <input type="date" {...register('end_date')} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Status Atual</label>
            <select {...register('status')} style={inputStyle}>
              <option value="ATIVO">Ativo (No Cargo Atualmente)</option>
              <option value="INATIVO">Inativo (Ex-membro / Mandato Expirado)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff' }} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (memberToEdit ? 'Atualizar Membro' : 'Adicionar Membro')}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const thStyle = { padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: '#4b5563', textTransform: 'uppercase' };
const tdStyle = { padding: '16px', verticalAlign: 'middle' };