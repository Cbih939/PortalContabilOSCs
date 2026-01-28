import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../../components/common/Icons.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import styles from './DocumentUpload.module.css';

// Ícone de Informação Local
const InfoIcon = () => (
  <svg 
    style={{ width: '14px', height: '14px', color: '#9ca3af', cursor: 'help', marginLeft: '6px' }} 
    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function DocumentUpload({ onUpload, isLoading, className = '' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo primeiro.');
      return;
    }
    if (isLoading) return;
    setError(null);

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (err) {
      console.error('Falha no upload:', err);
    }
  };

  const dropzoneClasses = `${styles.dropzone} ${error ? styles.dropzoneError : ''}`;

  return (
    <div className={`${styles.card} ${className}`}>
      <h2 className={styles.title}>
        Enviar Documento
        {/* Adicionado Tooltip Explicativo aqui */}
        <div className={styles.tooltipContainer}>
          <InfoIcon />
          <span className={styles.tooltipText}>
            Selecione o arquivo oficial (Estatuto, Ata, etc) já assinado e registrado. O sistema aceita formatos PDF, Word, Excel e Imagens.
          </span>
        </div>
      </h2>

      <div className={dropzoneClasses}>
        <UploadIcon className={styles.uploadIcon} />
        <label htmlFor="file-upload" className={styles.selectLabel}>
          Selecione um arquivo
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            ref={fileInputRef}
            className={styles.fileInput}
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
          />
        </label>
        <p className={styles.fileHint}>
          PDF, DOCX, XLSX, XLS, JPG, PNG
        </p>
        {selectedFile && (
          <p className={styles.fileName}>
            {selectedFile.name}
          </p>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>

      <Button
        onClick={handleUploadClick}
        className={styles.uploadButton}
        disabled={isLoading || !selectedFile}
        variant="primary"
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <UploadIcon className="h-5 w-5 mr-2" />
        )}
        {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
      </Button>
    </div>
  );
}