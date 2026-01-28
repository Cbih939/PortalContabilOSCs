// src/pages/osc/components/DocumentUpload.jsx

import React, { useState, useRef } from 'react';
// import { clsx } from 'clsx'; // Não mais necessário
import { UploadIcon } from '../../../components/common/Icons.jsx';
import Button from '../../../components/common/Button.jsx';
import Spinner from '../../../components/common/Spinner.jsx';
import styles from './DocumentUpload.module.css'; // Importa CSS Module

/**
 * Componente "card" de upload de documento (CSS Modules).
 */
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
      console.error('Falha no upload (visto pelo DocumentUpload):', err);
      // O erro da API já foi mostrado pelo hook no pai
      // Não limpamos o selectedFile para permitir nova tentativa
    }
  };

  // Determina se a dropzone deve ter estilo de erro
  const dropzoneClasses = `${styles.dropzone} ${error ? styles.dropzoneError : ''}`;

  return (
    <div className={`${styles.card} ${className}`}>
      <h2 className={styles.title}>
        Enviar Documento
      </h2>

      {/* Área de Seleção */}
      <div className={dropzoneClasses}>
        <UploadIcon className={styles.uploadIcon} />
        <label htmlFor="file-upload" className={styles.selectLabel}>
          Selecione um arquivo
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            ref={fileInputRef}
            className={styles.fileInput} // Aplica classe para esconder
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

      {/* Botão de Envio */}
      <Button
        onClick={handleUploadClick}
        className={styles.uploadButton}
        disabled={isLoading || !selectedFile}
        variant="primary" // Usa a variante azul
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" /> /* Classe mr-2 pode precisar de CSS global */
        ) : (
          <UploadIcon className="h-5 w-5 mr-2" /> /* Idem */
        )}
        {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
      </Button>
    </div>
  );
}