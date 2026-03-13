// src/components/common/FileUpload.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './FileUpload.module.css'; 
import { UploadIcon, FileIcon, XIcon } from './Icons.jsx';

/**
 * Componente reutilizável de Upload (Drag-and-Drop)
 */
export default function FileUpload({
  onFileSelect, 
  label,
  acceptedTypes = { 'application/pdf': ['.pdf'] }, 
  description = "Carregar arquivos ou arraste e solte",
  hint = "" // <--- O SEGREDO ESTÁ AQUI: Removemos o texto fixo do PDF!
}) {
  const [file, setFile] = useState(null); 

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (onFileSelect) {
        onFileSelect(selectedFile); 
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    multiple: false, 
    maxSize: 5 * 1024 * 1024, 
    onDropRejected: (files) => {
        alert(`Ficheiro rejeitado: O tamanho máximo é 5MB e o formato deve ser o correto para este campo.`);
    }
  });

  const removeFile = (e) => {
      e.stopPropagation(); 
      setFile(null);
      if (onFileSelect) {
        onFileSelect(null); 
      }
  };

  return (
    <div className={styles.fieldContainer}>
      <label className={styles.label}>{label}</label>
      <div
        {...getRootProps()}
        className={`
          ${styles.dropzoneBase}
          ${isDragActive ? styles.dropzoneActive : ''}
          ${isFocused ? styles.dropzoneFocused : ''}
        `}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className={styles.filePreview}>
              <FileIcon className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name}</span>
              <button onClick={removeFile} className={styles.removeButton} title="Remover ficheiro">
                  <XIcon />
              </button>
          </div>
        ) : (
          <div className={styles.uploadPrompt}>
            <UploadIcon className={styles.uploadIcon} />
            <p className={styles.uploadDescription}>{description}</p>
            {/* O hint só vai aparecer se você passar alguma coisa explícita no componente pai */}
            {hint && <p className={styles.uploadHint}>{hint}</p>}
          </div>
        )}
      </div>
    </div>
  );
}