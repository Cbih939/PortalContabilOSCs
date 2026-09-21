import React, { useState, useEffect, useMemo } from 'react';
import * as docService from '../../services/documentService.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './Documents.module.css';
import { FiDownload, FiFileText, FiImage, FiAlertTriangle, FiChevronDown, FiSearch } from 'react-icons/fi';

const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const isImage = (name) => /\.(jpg|jpeg|png|webp|gif)$/i.test(name || '');

/** "março", "março e abril", "março, abril e maio" */
const joinMonths = (months) => {
  const names = months.map((m) => MONTH_NAMES[m - 1]);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
};

const lateMessage = (osc) => {
  const n = osc.late_months.length;
  return `Esta OSC ainda deve o envio de arquivos referentes ${n > 1 ? 'aos meses' : 'ao mês'} de ${joinMonths(osc.late_months)} de ${osc.year}.`;
};

export default function ContadorDocumentsPage() {
  const [oscs, setOscs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setOscs(await docService.getReceivedByOsc());
      } catch (e) {
        console.error('Erro ao carregar documentos:', e);
        setError('Não foi possível carregar os documentos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? oscs.filter((o) => (o.name || '').toLowerCase().includes(q)) : oscs;
  }, [oscs, search]);

  const handleDownload = async (doc) => {
    try {
      await docService.saveDocument(doc.id, doc.original_name || 'documento');
    } catch (e) {
      console.error('Erro ao baixar documento:', e);
      window.alert('Erro ao baixar o arquivo. Tente novamente.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWithInfo}>
        <div>
          <h1 className={styles.title}>Documentos Recebidos das OSCs</h1>
          <p className={styles.subtitle}>Escolha uma OSC para ver os documentos enviados, do mais recente ao mais antigo.</p>
        </div>
      </div>

      {oscs.length > 5 && (
        <label className={styles.search}>
          <FiSearch aria-hidden="true" />
          <input type="search" placeholder="Buscar OSC..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar OSC" />
        </label>
      )}

      {isLoading ? (
        <div className={styles.center}><Spinner text="Carregando documentos..." /></div>
      ) : error ? (
        <div className={styles.empty} role="alert">{error}</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>{oscs.length === 0 ? 'Nenhuma OSC vinculada até o momento.' : 'Nenhuma OSC encontrada.'}</div>
      ) : (
        <ul className={styles.oscList}>
          {filtered.map((osc) => {
            const isOpen = openId === osc.id;
            const late = osc.late_months.length > 0;
            return (
              <li key={osc.id} className={styles.oscItem}>
                <div className={styles.oscRow}>
                  <button
                    type="button"
                    className={`${styles.oscBtn} ${isOpen ? styles.oscBtnOpen : ''}`}
                    aria-expanded={isOpen}
                    aria-controls={`osc-docs-${osc.id}`}
                    onClick={() => setOpenId(isOpen ? null : osc.id)}
                  >
                    <span className={styles.oscName}>{osc.name}</span>
                    <span className={styles.oscCount}>{osc.documents.length} {osc.documents.length === 1 ? 'documento' : 'documentos'}</span>
                    <FiChevronDown className={styles.chevron} aria-hidden="true" />
                  </button>

                  {late && (
                    <span className={styles.alertWrap} tabIndex={0} role="img" aria-label={lateMessage(osc)}>
                      <FiAlertTriangle className={styles.alertIcon} aria-hidden="true" />
                      <span className={styles.alertTip} role="tooltip">{lateMessage(osc)}</span>
                    </span>
                  )}
                </div>

                {isOpen && (
                  <div id={`osc-docs-${osc.id}`} className={styles.docsPanel}>
                    {late && <p className={styles.lateNote}><FiAlertTriangle aria-hidden="true" /> {lateMessage(osc)}</p>}

                    {osc.documents.length === 0 ? (
                      <p className={styles.emptyInline}>Esta OSC ainda não enviou documentos.</p>
                    ) : (
                      <ul className={styles.docList}>
                        {osc.documents.map((doc) => {
                          const Icon = isImage(doc.original_name) ? FiImage : FiFileText;
                          return (
                            <li key={doc.id}>
                              <button type="button" className={styles.docRow} onClick={() => handleDownload(doc)} aria-label={`Baixar ${doc.original_name}`}>
                                <Icon className={styles.docIcon} aria-hidden="true" />
                                <span className={styles.docMain}>
                                  <span className={styles.docName}>{doc.original_name}</span>
                                  <span className={styles.docMeta}>
                                    {formatDateTime(doc.created_at)} · enviado por {doc.uploader_name || 'usuário não identificado'}
                                    {doc.ref_month && doc.ref_year ? ` · ref. ${MONTH_NAMES[doc.ref_month - 1]}/${doc.ref_year}` : ''}
                                  </span>
                                </span>
                                <FiDownload className={styles.docDownload} aria-hidden="true" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
