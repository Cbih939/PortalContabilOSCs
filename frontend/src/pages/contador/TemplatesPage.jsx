import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import * as templateService from '../../services/templateService.js';
import useApi from '../../hooks/useApi.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { formatDate } from '../../utils/formatDate.js';

import Card, { CardBody } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import FileUpload from '../../components/common/FileUpload.jsx'; 
import styles from './TemplatesPage.module.css';

import { FiInfo, FiFile, FiTrash2, FiUploadCloud } from 'react-icons/fi';

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
      const data = Array.isArray(response) ? response : (response?.data || []);
      setTemplates(data);
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
      const response = await templateService.uploadTemplate(formData);
      const newTemplate = response?.data?.template || response?.data || response?.template || response;
      const templateName = newTemplate?.file_name || data.file_name;

      setTemplates(prev => [newTemplate, ...prev].sort((a,b) => (a?.file_name || '').localeCompare(b?.file_name || '')));
      addNotification(`Modelo "${templateName}" enviado com sucesso!`, 'success');
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
          <FiInfo className={styles.infoIcon} />
          <span className={styles.tooltipText}>
            Nesta área você define as planilhas de controle e documentos-base que suas OSCs poderão baixar. Estes arquivos servem como guia para a organização documental delas.
          </span>
        </div>
      </div>
      
      <div className={styles.grid}>
        
        <div>
          <Card>
            <CardBody>
              <div className={styles.headerWithInfo} style={{ marginBottom: '15px' }}>
                <h3 className={styles.formTitle} style={{ border: 'none', margin: 0, padding: 0 }}>Enviar Novo Modelo</h3>
                <div className={styles.tooltipContainer}>
                  <FiInfo className={styles.infoIcon} />
                  <span className={styles.tooltipText}>
                    Escolha um nome claro (ex: Controle de Caixa) e anexe o arquivo (Excel, PDF ou Word). O arquivo ficará disponível na aba "Docs | Modelos" da OSC.
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit(onSubmitUpload)} className={styles.form}>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="file_name" className={styles.formLabel}>Nome de Exibição *</label>
                  <input
                    id="file_name"
                    type="text"
                    {...register('file_name')}
                    placeholder="Ex: Modelo de Controle Financeiro"
                    className={`${styles.formInput} ${errors.file_name ? styles.formInputError : ''}`}
                  />
                  {errors.file_name && <span className={styles.errorMessage}>{errors.file_name.message}</span>}
                </div>
                
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

                <div className={styles.submitActions}>
                  <Button type="submit" variant="primary" disabled={isUploading} icon={<FiUploadCloud />}>
                    {isUploading ? <Spinner size="sm" /> : 'Enviar Modelo'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody>
              <h3 className={styles.listTitle}>Modelos Enviados</h3>
              <div className={styles.listContainer}>
                {isLoadingList ? (
                  <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}><Spinner text="Carregando modelos..." /></div>
                ) : errorLoading ? (
                  <p className={styles.emptyText} style={{ color: 'red' }}>{errorLoading}</p>
                ) : templates.length === 0 ? (
                  <p className={styles.emptyText}>Nenhum modelo enviado.</p>
                ) : (
                  templates.map(template => (
                    <div key={template.id} className={styles.templateItem}>
                      <div className={styles.fileInfo}>
                        <FiFile className={styles.fileIcon} />
                        <div className={styles.fileText}>
                          <span className={styles.fileName}>{template.file_name}</span>
                          <span className={styles.fileDescription}>
                            Enviado em: {formatDate(template.created_at || template.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(template)}
                        title="Apagar modelo"
                        disabled={isDeleting}
                        icon={<FiTrash2 />}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}