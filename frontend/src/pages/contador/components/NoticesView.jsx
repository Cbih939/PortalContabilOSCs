import React, { useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import Card, { CardBody } from '../../../components/ui/Card.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import styles from './NoticesView.module.css';
import { formatDate } from '../../../utils/formatDate.js';
import { FiSend } from 'react-icons/fi';

export default function NoticesView({ oscs = [], sentNotices = [], onSendNotice, isLoading }) {
  const [selectedOsc, setSelectedOsc] = useState('all');
  const [noticeType, setNoticeType] = useState('Informativo');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMessage) {
      alert('Por favor, preencha o título e a mensagem.');
      return;
    }
    if (isLoading) return;
    onSendNotice({
      oscId: selectedOsc === 'all' ? null : parseInt(selectedOsc),
      type: noticeType,
      title: noticeTitle,
      message: noticeMessage,
    });
    setNoticeTitle('');
    setNoticeMessage('');
  };

  const getBorderClass = (type) => {
    switch (type) {
      case 'Urgente': return styles.borderUrgent;
      case 'Lembrete': return styles.borderReminder;
      default: return styles.borderInfo;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Canal de Avisos</h2>
      <div className={styles.grid}>
        
        {/* Formulário */}
        <div>
          <Card>
            <CardBody>
              <h3 className={styles.formTitle}>Enviar Novo Aviso</h3>
              <form onSubmit={handleSubmit} className={styles.formFields}>
                <div className={styles.inputGroup}>
                  <label htmlFor="osc-select" className={styles.formLabel}>Enviar para:</label>
                  <select id="osc-select" value={selectedOsc} onChange={e => setSelectedOsc(e.target.value)} className={styles.formSelect}>
                    <option value="all">Todas as OSCs</option>
                    {oscs.map(osc => <option key={osc.id} value={osc.id}>{osc.name || osc.razao_social}</option>)}
                  </select>
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="type-select" className={styles.formLabel}>Tipo de Aviso:</label>
                  <select id="type-select" value={noticeType} onChange={e => setNoticeType(e.target.value)} className={styles.formSelect}>
                    <option>Informativo</option>
                    <option>Lembrete</option>
                    <option>Urgente</option>
                  </select>
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="notice-title" className={styles.formLabel}>Título:</label>
                  <input
                    id="notice-title" type="text"
                    value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} required
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="notice-message" className={styles.formLabel}>Mensagem:</label>
                  <textarea id="notice-message" value={noticeMessage} onChange={e => setNoticeMessage(e.target.value)} className={styles.formTextarea} required />
                </div>
                
                <div className={styles.submitActions}>
                  <Button type="submit" variant="primary" disabled={isLoading} icon={<FiSend />}>
                    {isLoading ? <Spinner size="sm" /> : 'Enviar Aviso'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Histórico */}
        <div>
          <Card>
            <CardBody>
              <h3 className={styles.historyTitle}>Histórico de Envios</h3>
              <div className={styles.historyList}>
                {sentNotices.length > 0 ? (
                  sentNotices.map(notice => (
                    <div key={notice.id} className={`${styles.noticeItem} ${getBorderClass(notice.type)}`}>
                      <div className={styles.noticeHeader}>
                        <h4 className={styles.noticeTitle}>{notice.title}</h4>
                        <span className={styles.noticeDate}>{formatDate(notice.date)}</span>
                      </div>
                      <p className={styles.noticeMessage}>{notice.message}</p>
                      <p className={styles.noticeRecipient}>Para: {notice.oscName}</p>
                    </div>
                  ))
                 ) : (
                   <p className={styles.emptyText}>Nenhum aviso enviado ainda.</p>
                 )}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}