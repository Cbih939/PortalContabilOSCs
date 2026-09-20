import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiAlertCircle, FiX, FiRefreshCw } from 'react-icons/fi';
import StatusBadge from '../../../components/dashboard/StatusBadge.jsx';
import { UPLOAD_ACCEPT, UPLOAD_MAX_MB } from '../../../utils/constants.js';
import styles from './DocumentUpload.module.css';

const MAX_BYTES = UPLOAD_MAX_MB * 1024 * 1024;

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const validate = (file) => {
  const ext = `.${file.name.split('.').pop().toLowerCase()}`;
  if (!UPLOAD_ACCEPT.includes(ext)) return 'Formato não aceito. Use PDF, Word, Excel, imagem (JPG/PNG) ou similares.';
  if (file.size > MAX_BYTES) return `Arquivo maior que ${UPLOAD_MAX_MB} MB (${formatSize(file.size)}).`;
  if (file.size === 0) return 'O arquivo está vazio.';
  return null;
};

let counter = 0;

/** Pronto para enviar (ou para tentar de novo, se falhou por motivo de rede/servidor). */
const isSendable = (it) => it.status === 'ready' || (it.status === 'error' && !validate(it.file));

/**
 * Envio de documentos: o usuário entende o que enviar, onde, formatos, tamanho máximo,
 * progresso, resultado e status. Aceita vários arquivos (enviados em sequência).
 *
 * @param {(file: File, onProgress: (pct:number)=>void) => Promise<void>} onUpload
 */
export default function DocumentUpload({ onUpload, className = '', id = 'enviar' }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]); // { id, file, status: ready|uploading|done|error, progress, error, sentAt }
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);

  const patch = (itemId, data) => setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...data } : it)));

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).map((file) => {
      const error = validate(file);
      counter += 1;
      return { id: counter, file, status: error ? 'error' : 'ready', progress: 0, error };
    });
    if (incoming.length) setItems((prev) => [...prev, ...incoming]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (itemId) => setItems((prev) => prev.filter((it) => it.id !== itemId));

  const sendAll = async () => {
    if (running) return;
    setRunning(true);
    const queue = items.filter(isSendable);
    for (const it of queue) {
      patch(it.id, { status: 'uploading', progress: 0, error: null });
      try {
        await onUpload(it.file, (pct) => patch(it.id, { progress: pct }));
        patch(it.id, { status: 'done', progress: 100, sentAt: new Date() });
      } catch (err) {
        patch(it.id, { status: 'error', error: err?.response?.data?.message || err?.message || 'Falha no envio. Tente novamente.' });
      }
    }
    setRunning(false);
  };

  const pending = items.filter(isSendable);
  const allDone = items.length > 0 && items.every((it) => it.status === 'done');

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <section className={`${styles.card} ${className}`} id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>Enviar documento</h2>
      <p className={styles.help}>
        Envie os documentos do mês ao seu escritório contábil. Formatos aceitos: PDF, Word, Excel e imagens (JPG, PNG). Tamanho máximo: {UPLOAD_MAX_MB} MB por arquivo.
      </p>

      <label
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.input}
          accept={UPLOAD_ACCEPT.join(',')}
          onChange={(e) => addFiles(e.target.files)}
          disabled={running}
        />
        <span className={styles.dropIcon}><FiUploadCloud aria-hidden="true" /></span>
        <strong className={styles.dropTitle}>Selecione seus documentos</strong>
        <span className={styles.dropHint}>PDF, JPG, PNG, DOCX, XLSX… até {UPLOAD_MAX_MB} MB</span>
        <span className={styles.selectBtn}>Selecionar</span>
        <span className={styles.dropHintDesktop}>ou arraste os arquivos até aqui</span>
      </label>

      {items.length > 0 && (
        <ul className={styles.list} aria-live="polite">
          {items.map((it) => (
            <li key={it.id} className={`${styles.item} ${styles[`item_${it.status}`]}`}>
              <span className={styles.itemIcon}>
                {it.status === 'done' ? <FiCheckCircle aria-hidden="true" /> : it.status === 'error' ? <FiAlertCircle aria-hidden="true" /> : <FiFileText aria-hidden="true" />}
              </span>

              <div className={styles.itemBody}>
                <strong className={styles.itemName} title={it.file.name}>{it.file.name}</strong>
                <small className={styles.itemMeta}>
                  {formatSize(it.file.size)}
                  {it.status === 'done' && it.sentAt && ` · Enviado em ${it.sentAt.toLocaleDateString('pt-BR')}`}
                </small>

                {it.status === 'uploading' && (
                  <div className={styles.progressWrap}>
                    <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={it.progress} aria-label={`Enviando ${it.file.name}`}>
                      <span style={{ width: `${it.progress}%` }} />
                    </div>
                    <small>{it.progress < 100 ? `Enviando… ${it.progress}%` : 'Processando…'}</small>
                  </div>
                )}

                {it.status === 'error' && <p className={styles.itemError} role="alert">{it.error}</p>}
              </div>

              <div className={styles.itemSide}>
                {it.status === 'done' && (
                  <>
                    <span className={styles.okText}>Documento enviado</span>
                    <StatusBadge status="PENDENTE" />
                  </>
                )}
                {it.status !== 'uploading' && it.status !== 'done' && (
                  <button type="button" className={styles.iconBtn} onClick={() => remove(it.id)} aria-label={`Remover ${it.file.name}`}>
                    <FiX aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        {allDone ? (
          <button type="button" className={styles.secondaryBtn} onClick={() => setItems([])}>
            <FiRefreshCw aria-hidden="true" /> Enviar outros documentos
          </button>
        ) : (
          <button type="button" className={styles.primaryBtn} onClick={sendAll} disabled={running || pending.length === 0}>
            <FiUploadCloud aria-hidden="true" />
            {running ? 'Enviando…' : pending.length > 1 ? `Enviar ${pending.length} arquivos` : 'Enviar arquivo'}
          </button>
        )}
      </div>
    </section>
  );
}
