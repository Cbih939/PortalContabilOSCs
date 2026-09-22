import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../ui/Button.jsx';
import { UPLOAD_ACCEPT, UPLOAD_MAX_MB } from '../../utils/constants.js';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';
import styles from './EditDocumentModal.module.css';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DOC_TYPES = [
  { value: 'MENSAL', label: 'Mensal (Contábil / Fiscal)' },
  { value: 'RELATORIO', label: 'Relatório Mês a Mês' },
  { value: 'FIXO', label: 'Fixo (Atas, Estatutos, Cartão CNPJ)' },
  { value: 'CERTIFICACAO', label: 'Certificação (Documento Fixo)' },
];
const MAX_BYTES = UPLOAD_MAX_MB * 1024 * 1024;

const validateFile = (file) => {
  const ext = `.${file.name.split('.').pop().toLowerCase()}`;
  if (!UPLOAD_ACCEPT.includes(ext)) return 'Formato não aceito. Use PDF, Word, Excel, imagem (JPG/PNG) ou similares.';
  if (file.size > MAX_BYTES) return `Arquivo maior que ${UPLOAD_MAX_MB} MB.`;
  if (file.size === 0) return 'O arquivo está vazio.';
  return null;
};

/**
 * Corrige o envio de um documento: troca o arquivo (opcional) e/ou o tipo e a
 * competência (mês/ano). Usado tanto pela OSC quanto pelo contador, quando o
 * arquivo certo foi enviado com dados errados ou quando o arquivo em si está errado.
 *
 * @param {object} doc - { id, original_name, doc_type, ref_month, ref_year }
 * @param {(id: number, formData: FormData, onProgress: (pct:number)=>void) => Promise<void>} onSave
 */
export default function EditDocumentModal({ isOpen, onClose, doc, onSave, onSaved }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [docType, setDocType] = useState(doc?.doc_type || 'MENSAL');
  const [refMonth, setRefMonth] = useState(doc?.ref_month || new Date().getMonth() + 1);
  const [refYear, setRefYear] = useState(doc?.ref_year || new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Reabre o formulário já preenchido com os dados atuais sempre que um novo documento é passado.
  React.useEffect(() => {
    if (isOpen && doc) {
      setFile(null);
      setFileError('');
      setDocType(doc.doc_type && doc.doc_type !== 'CONCLUSO TEC' ? doc.doc_type : 'MENSAL');
      setRefMonth(doc.ref_month || new Date().getMonth() + 1);
      setRefYear(doc.ref_year || new Date().getFullYear());
      setError('');
      setProgress(0);
    }
  }, [isOpen, doc]);

  if (!doc) return null;

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0] || null;
    if (!picked) { setFile(null); setFileError(''); return; }
    const err = validateFile(picked);
    setFileError(err || '');
    setFile(err ? null : picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('doc_type', docType);
      formData.append('ref_month', refMonth);
      formData.append('ref_year', refYear);
      await onSave(doc.id, formData, setProgress);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao salvar as correções. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? () => {} : onClose}
      title="Corrigir documento"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" form="edit-document-form" variant="primary" loading={saving}>
            Salvar correção
          </Button>
        </>
      }
    >
      <form id="edit-document-form" onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.currentFile}>
          <FiFileText aria-hidden="true" /> Arquivo atual: <strong>{doc.original_name}</strong>
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-doc-file">Substituir arquivo (opcional)</label>
          <label htmlFor="edit-doc-file" className={styles.fileDrop}>
            <FiUploadCloud aria-hidden="true" />
            <span>{file ? file.name : 'Escolher outro arquivo...'}</span>
          </label>
          <input id="edit-doc-file" type="file" accept={UPLOAD_ACCEPT.join(',')} onChange={handleFileChange} className={styles.hiddenInput} />
          {fileError && <p className={styles.fieldError} role="alert">{fileError}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-doc-type">Tipo de documento</label>
          <select id="edit-doc-type" className="input-clean" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className={styles.rowGrid}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-doc-month">Mês de referência</label>
            <select id="edit-doc-month" className="input-clean" value={refMonth} onChange={(e) => setRefMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-doc-year">Ano de referência</label>
            <input id="edit-doc-year" type="number" className="input-clean" min="2000" max="2100"
              value={refYear} onChange={(e) => setRefYear(Number(e.target.value))} />
          </div>
        </div>

        <p className={styles.hint}>Ao salvar, o documento volta para "Em análise" para nova conferência da contabilidade.</p>

        {saving && file && (
          <div className={styles.progressBar}><span style={{ width: `${progress}%` }} /></div>
        )}
        {error && <p className={styles.fieldError} role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
