import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as userService from '../../services/userService.js';
import * as alertService from '../../services/alertService.js';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { FiSend, FiBell, FiInfo, FiAlertCircle, FiClock } from 'react-icons/fi';
import styles from './AdminNoticesPage.module.css';
import { formatDate } from '../../utils/formatDate.js';
import { ROLES } from '../../utils/constants.js';

const schema = yup.object().shape({
  targetUser: yup.string().required(),
  type: yup.string().required(),
  title: yup.string().required('O título é obrigatório.'),
  message: yup.string().required('A mensagem é obrigatória.'),
});

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

  const { request: sendNoticeRequest, isLoading: isSending } = useApi(
      alertService.sendNotice, { showErrorNotification: false }
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setErrorLoading(null);
      try {
        const [usersResponse, historyResponse] = await Promise.all([
          userService.getAllUsers(),
          alertService.getSentNoticesHistory(),
        ]);

        const users = usersResponse.data || [];
        setAllUsers(users);

        const formattedHistory = (historyResponse.data || []).map(notice => {
            let oscName = 'Sistema (Broadcast)';
            if (notice.osc_id) {
                oscName = users.find(o => o.id === notice.osc_id)?.name || 'OSC Desconhecida';
            } else if (notice.osc_id === null && notice.type === 'Informativo') {
                oscName = 'Todas as OSCs';
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

  const onSubmit = async (data) => {
    let oscId = null;
    let targetName = "Todos os Usuários";

    if (data.targetUser === 'all_oscs') {
        oscId = null; 
        targetName = "Todas as OSCs";
    } else if (data.targetUser === 'all_contadores') {
        oscId = null;
        targetName = "Todos (Contadores)";
    } else if (data.targetUser !== 'all_users') {
        oscId = parseInt(data.targetUser);
        targetName = allUsers.find(u => u.id === oscId)?.name || 'Desconhecido';
    }

    const payload = {
        oscId: oscId,
        type: data.type,
        title: data.title,
        message: data.message,
    };

    try {
        const newNotice = await sendNoticeRequest(payload);
        setSentNotices(prev => [{ ...newNotice, oscName: targetName, date: newNotice.date }, ...prev]);
        addNotification(`Aviso enviado com sucesso para ${targetName}!`, 'success');
        reset({ targetUser: data.targetUser, type: data.type, title: '', message: '' }); 
    } catch (err) {
         addNotification(`Falha ao enviar aviso: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const getNoticeIcon = (type) => {
    switch (type) {
      case 'Urgente': return <FiAlertCircle className={styles.iconUrgent} size={20} />;
      case 'Lembrete': return <FiClock className={styles.iconReminder} size={20} />;
      default: return <FiInfo className={styles.iconInfo} size={20} />;
    }
  };

  if (isLoadingData) return <div className={styles.loadingContainer}><Spinner text="A carregar histórico e configurações..." /></div>;
  if (errorLoading) return <div className={styles.errorState}>{errorLoading}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Canal de Avisos Global</h1>
        <p className={styles.pageSubtitle}>Dispare mensagens e alertas para toda a base ou segmentos específicos.</p>
      </div>
      
      <div className={styles.grid}>
        {/* Formulário */}
        <div className={styles.formColumn}>
          <Card padding="none" className={styles.formCard}>
            <CardHeader title="Enviar Novo Aviso" />
            <CardBody className={styles.formBody}>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.formLayout}>
                <div className={styles.formGroup}>
                  <label htmlFor="target-select" className={styles.formLabel}>Enviar para:</label>
                  <select id="target-select" {...register('targetUser')} className={styles.formInput}>
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
                
                <div className={styles.formGroup}>
                  <label htmlFor="type-select" className={styles.formLabel}>Tipo de Aviso:</label>
                  <select id="type-select" {...register('type')} className={styles.formInput}>
                    <option value="Informativo">Informativo</option>
                    <option value="Lembrete">Lembrete</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="notice-title" className={styles.formLabel}>Título:</label>
                  <input id="notice-title" type="text" {...register('title')} className={styles.formInput} placeholder="Ex: Manutenção Programada" />
                  {errors.title && <p className={styles.errorMessage}>{errors.title.message}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="notice-message" className={styles.formLabel}>Mensagem:</label>
                  <textarea id="notice-message" rows="5" {...register('message')} className={styles.formTextarea} placeholder="Escreva a mensagem aqui..."></textarea>
                  {errors.message && <p className={styles.errorMessage}>{errors.message.message}</p>}
                </div>
                
                <div className={styles.formAction}>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={isSending}
                    icon={!isSending && <FiSend />}
                    size="lg"
                    block
                  >
                    {isSending ? 'Enviando...' : 'Enviar Aviso'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Histórico */}
        <div className={styles.historyColumn}>
          <Card padding="none" className={styles.historyCard}>
            <CardHeader title="Histórico de Envios" />
            <CardBody className={styles.historyBody}>
              <div className={styles.historyList}>
                {sentNotices.length > 0 ? (
                  sentNotices.map(notice => {
                    const typeClass = 
                      notice.type === 'Urgente' ? styles.borderUrgent :
                      notice.type === 'Lembrete' ? styles.borderReminder : 
                      styles.borderInfo;

                    return (
                      <div key={notice.id} className={`${styles.noticeItem} ${typeClass}`}>
                        <div className={styles.noticeHeader}>
                          <div className={styles.noticeTitleGroup}>
                            {getNoticeIcon(notice.type)}
                            <h4 className={styles.noticeTitle}>{notice.title}</h4>
                          </div>
                          <span className={styles.noticeDate}>{formatDate(notice.date)}</span>
                        </div>
                        <p className={styles.noticeMessage}>{notice.message}</p>
                        <div className={styles.noticeFooter}>
                          <span className={styles.noticeRecipient}>Enviado para: {notice.oscName}</span>
                        </div>
                      </div>
                    );
                  })
                 ) : (
                   <div className={styles.emptyState}>
                     <FiBell size={32} color="var(--text-muted)" />
                     <p>Nenhum aviso enviado pelo Admin.</p>
                   </div>
                 )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}