// src/pages/admin/AdminNoticesPage.jsx

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// Serviços API
import * as userService from '../../services/userService.js'; // Para buscar lista de users
import * as alertService from '../../services/alertService.js'; // Para enviar e buscar histórico
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Componentes
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { SendIcon } from '../../components/common/Icons.jsx';
import styles from './AdminNoticesPage.module.css'; // CSS da página
import { formatDate } from '../../utils/formatDate.js';
import { ROLES } from '../../utils/constants.js';

// Schema para o formulário de envio
const schema = yup.object().shape({
  targetUser: yup.string().required(), // 'all_users', 'all_oscs', 'all_contadores', ou um ID específico
  type: yup.string().required(),
  title: yup.string().required('O título é obrigatório.'),
  message: yup.string().required('A mensagem é obrigatória.'),
});

/**
 * Página de Envio de Avisos do Admin
 */
export default function AdminNoticesPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const addNotification = useNotification();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { targetUser: 'all_users', type: 'Informativo' }
  });

  // Hook para Enviar Aviso
  const { request: sendNoticeRequest, isLoading: isSending } = useApi(
      alertService.sendNotice, { showErrorNotification: false }
  );

  // Efeito para Buscar Dados (Todos Utilizadores e Histórico)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        // Busca Utilizadores e Histórico
        const [usersResponse, historyResponse] = await Promise.all([
          userService.getAllUsers(), // O Admin busca TODOS
          alertService.getSentNoticesHistory(), // Histórico (do Admin)
        ]);

        const users = usersResponse.data || [];
        setAllUsers(users);

        // Formata o histórico
        const formattedHistory = (historyResponse.data || []).map(notice => {
            let oscName = 'Sistema (Broadcast)';
            if (notice.osc_id) {
                oscName = users.find(o => o.id === notice.osc_id)?.name || 'OSC Desconhecida';
            } else if (notice.osc_id === null && notice.type === 'Informativo') {
                oscName = 'Todas as OSCs'; // Lógica do Contador
            }
            return { ...notice, oscName, date: notice.created_at || notice.date };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        setSentNotices(formattedHistory);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErrorLoading("Não foi possível carregar os dados da página.");
        addNotification("Erro ao carregar dados.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [addNotification]);

  // Handler para Enviar Aviso
  const onSubmit = async (data) => {
    let oscId = null; // Padrão é NULL (broadcast geral)
    let targetName = "Todos os Usuários";

    // Define o ID do destinatário
    if (data.targetUser === 'all_oscs') {
        oscId = null; // O backend (createAlert) já trata osc_id=null
        targetName = "Todas as OSCs";
    } else if (data.targetUser === 'all_contadores') {
        // TODO: Backend não suporta "só contadores" ainda.
        // Vamos tratar como broadcast geral por enquanto.
        oscId = null;
        targetName = "Todos (Contadores)";
    } else if (data.targetUser !== 'all_users') {
        oscId = parseInt(data.targetUser); // ID específico
        targetName = allUsers.find(u => u.id === oscId)?.name || 'Desconhecido';
    }

    const payload = {
        oscId: oscId, // Nome esperado pelo controller
        type: data.type,
        title: data.title,
        message: data.message,
    };

    try {
        const newNotice = await sendNoticeRequest(payload);
        setSentNotices(prev => [{ ...newNotice, oscName: targetName, date: newNotice.date }, ...prev]);
        addNotification(`Aviso enviado com sucesso para ${targetName}!`, 'success');
        reset({ targetUser: data.targetUser, type: data.type, title: '', message: '' }); // Limpa form
    } catch (err) {
         addNotification(`Falha ao enviar aviso: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  if (isLoadingData) { /* ... (Render Spinner) ... */ }
  if (errorLoading) { /* ... (Render Erro) ... */ }

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Canal de Avisos Global (Admin)</h2>
      <div className={styles.grid}>
        {/* Coluna do Formulário */}
        <div className={styles.formColumn}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>
            <h3 className={styles.formTitle}>Enviar Novo Aviso</h3>
            <div className={styles.formFields}>
              {/* Enviar para */}
              <div>
                <label htmlFor="target-select" className={styles.formLabel}>Enviar para:</label>
                <select id="target-select" {...register('targetUser')} className={styles.formSelect}>
                  <option value="all_users">TODOS OS USUÁRIOS (Geral)</option>
                  <option value="all_oscs">Todas as OSCs</option>
                  <option value="all_contadores">Todos os Contadores</option>
                  <optgroup label="Contadores Específicos">
                    {allUsers.filter(u => u.role === ROLES.CONTADOR).map(u => 
                      <option key={u.id} value={u.id}>{u.name} (Contador)</option>
                    )}
                  </optgroup>
                  <optgroup label="OSCs Específicas">
                     {allUsers.filter(u => u.role === ROLES.OSC).map(u => 
                      <option key={u.id} value={u.id}>{u.name} (OSC)</option>
                    )}
                  </optgroup>
                </select>
              </div>
              {/* Tipo de Aviso */}
              <div>
                <label htmlFor="type-select" className={styles.formLabel}>Tipo de Aviso:</label>
                <select id="type-select" {...register('type')} className={styles.formSelect}>
                  <option>Informativo</option>
                  <option>Lembrete</option>
                  <option>Urgente</option>
                </select>
              </div>
              {/* Título */}
              <Input label="Título:" id="notice-title" {...register('title')} error={errors.title?.message} required />
              {/* Mensagem */}
              <div>
                <label htmlFor="notice-message" className={styles.formLabel}>Mensagem:</label>
                <textarea id="notice-message" rows="5" {...register('message')} className={styles.formTextarea} required></textarea>
                {errors.message && <p className={styles.errorMessage}>{errors.message.message}</p>}
              </div>
              {/* Botão Enviar */}
              <Button type="submit" className={styles.submitButton} disabled={isSending} variant="primary">
                {isSending ? <Spinner size="sm" /> : <SendIcon />}
                {isSending ? 'Enviando...' : 'Enviar Aviso Global'}
              </Button>
            </div>
          </form>
        </div>

        {/* Coluna do Histórico */}
        <div className={styles.historyColumn}>
          <div className={styles.historyCard}>
            <h3 className={styles.historyTitle}>Histórico de Envios (Admin)</h3>
            <div className={styles.historyList}>
              {sentNotices.length > 0 ? (
                sentNotices.map(notice => (
                  <div key={notice.id} className={`${styles.noticeItem} ${styles.borderInfo}`}> {/* Simplificado */}
                    <div className={styles.noticeHeader}>
                      <p className={styles.noticeTitle}>{notice.title}</p>
                      <span className={styles.noticeDate}>{formatDate(notice.date)}</span>
                    </div>
                    <p className={styles.noticeMessage}>{notice.message}</p>
                    <p className={styles.noticeRecipient}>Para: {notice.oscName}</p>
                  </div>
                ))
               ) : (
                 <p className={styles.emptyText}>Nenhum aviso enviado pelo Admin.</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}