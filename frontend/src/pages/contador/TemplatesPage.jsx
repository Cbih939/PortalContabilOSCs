// src/pages/contador/TemplatesPage.jsx

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// Serviços e Hooks
import * as templateService from '../../services/templateService.js';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
// Componentes
import styles from './TemplatesPage.module.css';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import FileUpload from '../../components/common/FileUpload.jsx'; // Reutiliza componente
import { FileIcon, XIcon, UploadIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';

// Schema para o formulário de upload
const uploadSchema = yup.object().shape({
  file_name: yup.string().required('O nome de exibição é obrigatório.'),
  templateFile: yup
    .mixed()
    .required('Um ficheiro é obrigatório.')
    .test('fileSize', 'O ficheiro é muito grande (máx. 5MB)', value => value && value.size <= 5 * 1024 * 1024),
});

/**
 * Página para o Contador gerir os Ficheiros-Base (Modelos).
 */
export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const addNotification = useNotification();
  
  // Hook RHF para o formulário de upload
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: yupResolver(uploadSchema)
  });

  // Hook API para APAGAR
  const { request: deleteTemplateRequest, isLoading: isDeleting } = useApi(
      templateService.deleteTemplate, { showErrorNotification: false }
  );
  
  // Estado de loading para o UPLOAD (feito manualmente)
  const [isUploading, setIsUploading] = useState(false);

  // Função para buscar a lista de modelos
  const fetchTemplates = async () => {
    setIsLoadingList(true);
    setErrorLoading(null);
    try {
      const response = await templateService.getAllTemplates();
      setTemplates(response.data || []);
    } catch (err) {
      setErrorLoading("Não foi possível carregar os modelos.");
      addNotification("Erro ao carregar modelos.", "error");
    } finally {
      setIsLoadingList(false);
    }
  };

  // Busca inicial
  useEffect(() => {
    fetchTemplates();
  }, []); // Dependência vazia, mas addNotification é estável

  // Handler para submeter (fazer upload)
  const onSubmitUpload = async (data) => {
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file_name', data.file_name);
    formData.append('templateFile', data.templateFile); // 'templateFile' é o nome esperado pelo backend

    try {
      const newTemplate = await templateService.uploadTemplate(formData);
      setTemplates(prev => [newTemplate.data, ...prev].sort((a,b) => a.file_name.localeCompare(b.file_name)));
      addNotification(`Modelo "${newTemplate.data.file_name}" enviado com sucesso!`, 'success');
      reset(); // Limpa o formulário
    } catch (err) {
      console.error('Falha no upload do modelo:', err);
      addNotification(`Falha no upload: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handler para apagar
  const handleDelete = async (template) => {
    if (!window.confirm(`Tem a certeza que quer apagar o modelo "${template.file_name}"?`)) {
      return;
    }
    try {
      await deleteTemplateRequest(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      addNotification(`Modelo "${template.file_name}" apagado.`, 'success');
    } catch (err) {
      console.error('Falha ao apagar modelo:', err);
      addNotification(`Falha ao apagar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Gerenciar Modelos (Downloads Úteis)</h2>
      
      <div className={styles.grid}>
        {/* Coluna 1: Upload */}
        <div className={styles.uploadColumn}>
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Enviar Novo Modelo</h3>
            <form onSubmit={handleSubmit(onSubmitUpload)} className={styles.form}>
              <Input
                label="Nome de Exibição *"
                id="file_name"
                {...register('file_name')}
                error={errors.file_name?.message}
                placeholder="Ex: Modelo de Controle Financeiro"
              />
              
              <Controller
                name="templateFile"
                control={control}
                render={({ field: { onChange } }) => (
                  <FileUpload
                    label="Ficheiro *"
                    onFileSelect={(file) => onChange(file)} // Passa ficheiro para RHF
                    acceptedTypes={{}} // Aceita todos os tipos por agora
                    hint="Qualquer tipo (XLSX, PDF, DOCX, etc. Máx. 5MB)"
                  />
                )}
              />
              {errors.templateFile && <p className={styles.errorMessage}>{errors.templateFile.message}</p>}

              <Button type="submit" variant="primary" disabled={isUploading}>
                {isUploading ? <Spinner size="sm" className="mr-2" /> : <UploadIcon className="w-5 h-5 mr-2" />}
                {isUploading ? 'Enviando...' : 'Enviar Modelo'}
              </Button>
            </form>
          </div>
        </div>

        {/* Coluna 2: Lista de Modelos */}
        <div className={styles.listColumn}>
          <div className={styles.listCard}>
            <h3 className={styles.listTitle}>Modelos Enviados</h3>
            <div className={styles.listContainer}>
              {isLoadingList ? (
                <Spinner text="Carregando modelos..." />
              ) : errorLoading ? (
                <p className={styles.emptyText} style={{ color: 'red' }}>{errorLoading}</p>
              ) : templates.length === 0 ? (
                <p className={styles.emptyText}>Nenhum modelo enviado.</p>
              ) : (
                templates.map(template => (
                  <div key={template.id} className={styles.templateItem}>
                    <div className={styles.fileInfo}>
                      <FileIcon className={styles.fileIcon} />
                      <div className={styles.fileText}>
                        <span className={styles.fileName}>{template.file_name}</span>
                        <span className={styles.fileDescription}>
                          {template.description} (Enviado em: {formatDate(template.created_at)})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(template)}
                      className={styles.deleteButton}
                      title="Apagar modelo"
                      disabled={isDeleting} // Desabilita se estiver a apagar
                    >
                      <XIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}