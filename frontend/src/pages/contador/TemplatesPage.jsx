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
import FileUpload from '../../components/common/FileUpload.jsx'; 
import { FileIcon, XIcon, UploadIcon } from '../../components/common/Icons.jsx';
import { formatDate } from '../../utils/formatDate.js';

// Ícone de Informação (Tooltip) declarado localmente
const InfoIcon = () => (
  <svg 
    style={{ width: '16px', height: '16px', color: '#EC6D12', cursor: 'help', marginLeft: '8px' }} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const uploadSchema = yup.object().shape({
  file_name: yup.string().required('O nome de exibição é obrigatório.'),
  templateFile: yup
    .mixed()
    .required('Um ficheiro é obrigatório.')
    .test('fileSize', 'O ficheiro é muito grande (máx. 5MB)', value => value && value.size <= 5 * 1024 * 1024),
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const addNotification = useNotification();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: yupResolver(uploadSchema)
  });

  const { request: deleteTemplateRequest, isLoading: isDeleting } = useApi(
      templateService.deleteTemplate, { showErrorNotification: false }
  );
  
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const onSubmitUpload = async (data) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file_name', data.file_name);
    formData.append('templateFile', data.templateFile);

    try {
      const newTemplate = await templateService.uploadTemplate(formData);
      setTemplates(prev => [newTemplate.data, ...prev].sort((a,b) => a.file_name.localeCompare(b.file_name)));
      addNotification(`Modelo "${newTemplate.data.file_name}" enviado com sucesso!`, 'success');
      reset(); 
    } catch (err) {
      addNotification(`Falha no upload: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Tem a certeza que quer apagar o modelo "${template.file_name}"?`)) return;
    try {
      await deleteTemplateRequest(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      addNotification(`Modelo "${template.file_name}" apagado.`, 'success');
    } catch (err) {
      addNotification(`Falha ao apagar: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerWithInfo}>
        <h2 className={styles.title}>Gerenciar Modelos (Downloads Úteis)</h2>
        <div className={styles.tooltipContainer}>
          <InfoIcon />
          <span className={styles.tooltipText}>
            Nesta área você define as planilhas de controle e documentos-base que suas OSCs poderão baixar. Estes arquivos servem como guia para a organização documental delas.
          </span>
        </div>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.uploadColumn}>
          <div className={styles.formCard}>
            <div className={styles.headerWithInfo}>
              <h3 className={styles.formTitle}>Enviar Novo Modelo</h3>
              <div className={styles.tooltipContainer}>
                <InfoIcon />
                <span className={styles.tooltipText}>
                  Escolha um nome claro (ex: Controle de Caixa) e anexe o arquivo (Excel, PDF ou Word). O arquivo ficará disponível na aba "Docs | Modelos" da OSC.
                </span>
              </div>
            </div>
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
                    onFileSelect={(file) => onChange(file)} 
                    acceptedTypes={{}} 
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
                          Enviado em: {formatDate(template.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(template)}
                      className={styles.deleteButton}
                      title="Apagar modelo"
                      disabled={isDeleting}
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