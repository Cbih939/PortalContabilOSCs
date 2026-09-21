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

const NO_COMPETENCE = 0;

/** Agrupa por ano de competência > mês de competência (mais recente primeiro). Meses em atraso entram vazios. */
const buildTree = (osc) => {
  const years = new Map();
  const bucket = (y, m) => {
    if (!years.has(y)) years.set(y, new Map());
    const months = years.get(y);
    if (!months.has(m)) months.set(m, []);
    return months.get(m);
  };
  for (const doc of osc.documents) {
    if (doc.ref_year && doc.ref_month) bucket(Number(doc.ref_year), Number(doc.ref_month)).push(doc);
    else bucket(NO_COMPETENCE, NO_COMPETENCE).push(doc);
  }
  for (const m of osc.late_months) bucket(osc.year, m);
  return [...years.entries()]
    .sort((x, y) => (x[0] === NO_COMPETENCE ? 1 : y[0] === NO_COMPETENCE ? -1 : y[0] - x[0]))
    .map(([year, months]) => ({
      year,
      months: [...months.entries()].sort((x, y) => y[0] - x[0]).map(([month, docs]) => ({
        month, docs, late: year === osc.year && osc.late_months.includes(month) && docs.length === 0,
      })),
    }));
};

function CompetenceTree({ osc, onDownload }) {
  const tree = useMemo(() => buildTree(osc), [osc]);
  const [openYears, setOpenYears] = useState(() => new Set([osc.year]));
  const [openMonths, setOpenMonths] = useState(() => new Set());
  const toggle = (setter, key) => setter((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  if (tree.length === 0) return <p className={styles.emptyInline}>Esta OSC ainda não enviou documentos.</p>;

  return (
    <ul className={styles.tree}>
      {tree.map(({ year, months }) => {
        const yOpen = openYears.has(year);
        const total = months.reduce((n, m) => n + m.docs.length, 0);
        return (
          <li key={year} className={styles.yearItem}>
            <button type="button" className={styles.yearBtn} aria-expanded={yOpen} onClick={() => toggle(setOpenYears, year)}>
              <span>{year === NO_COMPETENCE ? 'Sem competência informada' : `Competência ${year}`}</span>
              <span className={styles.oscCount}>{total} {total === 1 ? 'documento' : 'documentos'}</span>
              <FiChevronDown className={`${styles.chevron} ${yOpen ? styles.chevronUp : ''}`} aria-hidden="true" />
            </button>

            {yOpen && (
              <ul className={styles.monthList}>
                {months.map(({ month, docs, late }) => {
                  const key = `${year}-${month}`;
                  const mOpen = openMonths.has(key);
                  return (
                    <li key={key} className={styles.monthItem}>
                      <button type="button" className={styles.monthBtn} aria-expanded={mOpen} onClick={() => toggle(setOpenMonths, key)}>
                        <span className={styles.monthName}>{month === NO_COMPETENCE ? 'Documentos avulsos' : MONTH_NAMES[month - 1]}</span>
                        {late && (
                          <span className={styles.monthLate}><FiAlertTriangle aria-hidden="true" /> Sem envio</span>
                        )}
                        <span className={styles.oscCount}>{docs.length} {docs.length === 1 ? 'documento' : 'documentos'}</span>
                        <FiChevronDown className={`${styles.chevron} ${mOpen ? styles.chevronUp : ''}`} aria-hidden="true" />
                      </button>

                      {mOpen && (docs.length === 0 ? (
                        <p className={styles.emptyInline}>Nenhum documento enviado para {MONTH_NAMES[month - 1]} de {year}.</p>
                      ) : (
                        <ul className={styles.docList}>
                          {docs.map((doc) => {
                            const Icon = isImage(doc.original_name) ? FiImage : FiFileText;
                            return (
                              <li key={doc.id}>
                                <button type="button" className={styles.docRow} onClick={() => onDownload(doc)} aria-label={`Baixar ${doc.original_name}`}>
                                  <Icon className={styles.docIcon} aria-hidden="true" />
                                  <span className={styles.docMain}>
                                    <span className={styles.docName}>{doc.original_name}</span>
                                    <span className={styles.docMeta}>
                                      {formatDateTime(doc.created_at)} · enviado por {doc.uploader_name || 'usuário não identificado'}
                                    </span>
                                  </span>
                                  <FiDownload className={styles.docDownload} aria-hidden="true" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ))}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

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
          <p className={styles.subtitle}>Escolha uma OSC e navegue por ano e mês de competência até o documento.</p>
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

                    <CompetenceTree osc={osc} onDownload={handleDownload} />
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
