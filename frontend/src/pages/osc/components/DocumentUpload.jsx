import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../../components/common/Icons.jsx';
import Button from '../../../components/ui/Button.jsx';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card.jsx';
import styles from './DocumentUpload.module.css';
import { FiInfo } from 'react-icons/fi';

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

  return (
    <Card className={className} padding="none">
      <CardHeader 
        className={styles.header}
        title="Enviar Documento" 
        action={
          <div className="tooltip-container">
            <FiInfo className="text-muted cursor-help" size={18} />
            <span className="tooltip-text tooltip-left">
              Selecione o arquivo oficial (Estatuto, Ata, etc) já assinado e registrado. O sistema aceita PDF, Word, Excel e Imagens.
            </span>
          </div>
        }
      />
      <CardBody className={styles.body}>
        <div className={`${styles.dropzone} ${error ? styles.dropzoneError : ''}`}>
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
          block
          loading={isLoading}
          icon={!isLoading && <UploadIcon className="h-5 w-5" />}
        >
          {isLoading ? 'Enviando...' : 'Enviar Arquivo'}
        </Button>
      </CardBody>
    </Card>
  );
}