// src/pages/contador/components/NoticesView.jsx

import React, { useState } from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import Button from '../../../components/common/Button.jsx';
import Input from '../../../components/common/Input.jsx'; // Usado para o Título
import Spinner from '../../../components/common/Spinner.jsx';
import { SendIcon } from '../../../components/common/Icons.jsx';
import styles from './NoticesView.module.css'; // Importa CSS Module
import { formatDate } from '../../../utils/formatDate.js'; // Helper de data

/**
 * Componente de Apresentação NoticesView (CSS Modules).
 */
export default function NoticesView({
  oscs = [],
  sentNotices = [],
  onSendNotice,
  isLoading,
}) {
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
    // Limpa o form (o pai trata notificação e estado)
    setNoticeTitle('');
    setNoticeMessage('');
  };

  // Helper para classe da borda
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
        {/* Coluna do Formulário */}
        <div className={styles.formColumn}>
          <form onSubmit={handleSubmit} className={styles.formCard}>
            <h3 className={styles.formTitle}>Enviar Novo Aviso</h3>
            <div className={styles.formFields}>
              {/* Enviar para */}
              <div>
                <label htmlFor="osc-select" className={styles.formLabel}>Enviar para:</label>
                <select id="osc-select" value={selectedOsc} onChange={e => setSelectedOsc(e.target.value)} className={styles.formSelect}>
                  <option value="all">Todas as OSCs</option>
                  {oscs.map(osc => <option key={osc.id} value={osc.id}>{osc.name}</option>)}
                </select>
              </div>
              {/* Tipo de Aviso */}
              <div>
                <label htmlFor="type-select" className={styles.formLabel}>Tipo de Aviso:</label>
                <select id="type-select" value={noticeType} onChange={e => setNoticeType(e.target.value)} className={styles.formSelect}>
                  <option>Informativo</option>
                  <option>Lembrete</option>
                  <option>Urgente</option>
                </select>
              </div>
              {/* Título */}
              <Input
                label="Título:"
                id="notice-title"
                type="text"
                value={noticeTitle}
                onChange={e => setNoticeTitle(e.target.value)}
                required
                // inputClassName={styles.formInput} // Usa estilo padrão do Input.jsx
              />
              {/* Mensagem */}
              <div>
                <label htmlFor="notice-message" className={styles.formLabel}>Mensagem:</label>
                <textarea id="notice-message" rows="5" value={noticeMessage} onChange={e => setNoticeMessage(e.target.value)} className={styles.formTextarea} required></textarea>
              </div>
              {/* Botão Enviar */}
              <Button type="submit" className={styles.submitButton} disabled={isLoading} variant="primary">
                {isLoading ? <Spinner size="sm" className="mr-2" /> : <SendIcon className="w-5 h-5 mr-2" />} {/* Classes globais ainda usadas */}
                {isLoading ? 'Enviando...' : 'Enviar Aviso'}
              </Button>
            </div>
          </form>
        </div>

        {/* Coluna do Histórico */}
        <div className={styles.historyColumn}>
          <div className={styles.historyCard}>
            <h3 className={styles.historyTitle}>Histórico de Envios</h3>
            <div className={styles.historyList}>
              {sentNotices.length > 0 ? (
                sentNotices.map(notice => (
                  <div key={notice.id} className={`${styles.noticeItem} ${getBorderClass(notice.type)}`}>
                    <div className={styles.noticeHeader}>
                      <p className={styles.noticeTitle}>{notice.title}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}