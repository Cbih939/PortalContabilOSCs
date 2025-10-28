// src/components/common/FileUpload.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './FileUpload.module.css'; // Criaremos este CSS
import { UploadIcon, FileIcon, XIcon } from './Icons.jsx';

/**
 * Componente reutilizável de Upload (Drag-and-Drop)
 *
 * Props:
 * - onFileSelect (function): Função chamada com o ficheiro selecionado.
 * - label (string): O título da caixa (ex: "Logotipo").
 * - acceptedTypes (object): Objeto para o react-dropzone (ex: {'image/*': []}).
 * - description (string): Texto de ajuda (ex: "Até 5 arquivos").
 * - initialFile (File | string): Ficheiro já carregado (não implementado totalmente aqui).
 */
export default function FileUpload({
  onFileSelect, // Função para passar o ficheiro para o formulário RHF
  label,
  acceptedTypes = { 'application/pdf': ['.pdf'] }, // Padrão PDF
  description = "Carregar arquivos ou arraste e solte",
  hint = "PDF (máx. 5MB)" // Hint de tipo/tamanho
}) {
  const [file, setFile] = useState(null); // Estado interno para mostrar nome

  // Callback quando o ficheiro é aceite
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (onFileSelect) {
        onFileSelect(selectedFile); // Passa o ficheiro para o React Hook Form
      }
    }
  }, [onFileSelect]);

  // Configuração do Dropzone
  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    multiple: false, // Aceita apenas 1 ficheiro
    maxSize: 5 * 1024 * 1024, // Limite de 5MB
    onDropRejected: (files) => {
        alert(`Ficheiro rejeitado: ${files[0].errors[0].message} (Tamanho máx: 5MB ou tipo inválido).`);
    }
  });

  const removeFile = (e) => {
      e.stopPropagation(); // Impede que o clique abra o seletor de ficheiros
      setFile(null);
      if (onFileSelect) {
        onFileSelect(null); // Informa o RHF que o ficheiro foi removido
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

        {/* Mostra o ficheiro selecionado ou a área de upload */}
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
            <p className={styles.uploadHint}>{hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}