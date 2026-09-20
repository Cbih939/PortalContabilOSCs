import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import Card, { CardBody, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { FiUpload, FiTrash2, FiFileText } from 'react-icons/fi';
import styles from './ManageLibrary.module.css';

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const addNotification = useNotification();

  const [form, setForm] = useState({ 
    title: '', 
    category: 'BIBLIOTECA', 
    ebookCategory: 'Governança', 
    file: null, 
    cover: null 
  });

  const standardTitles = [
    "Estatuto Social", "Ata de Fundação", "Regimento Interno", 
    "Declarações Usuais", "Estatuto MROSC", "Regimento MROSC", 
    "Estatuto CEBAS", "Regimento CEBAS", "Declarações CEBAS", 
    "Estatuto Profissional"
  ];

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await fileService.getFilesByCategory('');
      setFiles(data);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) return addNotification("Por favor, selecione o arquivo.", "error");

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    
    if (form.category === 'BIBLIOTECA') {
       formData.append('ebook_category', form.ebookCategory);
    }

    formData.append('file', form.file);
    if (form.cover) formData.append('cover', form.cover);

    setLoading(true);
    try {
      await fileService.uploadFile(formData);
      addNotification("Conteúdo publicado com sucesso!", "success");
      
      setForm({ 
        title: '', 
        category: 'BIBLIOTECA', 
        ebookCategory: 'Governança', 
        file: null, 
        cover: null 
      });
      
      document.getElementById('fileInput').value = "";
      if(document.getElementById('coverInput')) document.getElementById('coverInput').value = "";
      
      loadFiles();
    } catch (error) {
      addNotification("Erro ao enviar conteúdo.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file) => {
    if (window.confirm("Tem certeza que deseja excluir este conteúdo?")) {
      try {
        await fileService.deleteFile(file.id);
        addNotification("Conteúdo excluído com sucesso!", "success");
        loadFiles();
      } catch (err) {
        addNotification("Erro ao excluir conteúdo.", "error");
      }
    }
  };

  const renderFileSection = (title, categoryKey) => {
    const filteredFiles = files.filter(f => f.category === categoryKey);
    if (filteredFiles.length === 0) return null;

    return (
      <div className={styles.categorySection}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <div className={styles.fileGrid}>
          {filteredFiles.map(f => (
            <div key={f.id} className={styles.fileCard}>
              <div className={styles.coverWrapper}>
                {f.cover_path ? (
                  <img 
                    src={`https://contacomigo.org.br/${f.cover_path.replace(/\\/g, '/')}`} 
                    alt={f.title} 
                    className={styles.gridCover} 
                  />
                ) : (
                  <div className={styles.placeholderCover}>
                    <FiFileText size={32} color="var(--text-muted)" />
                  </div>
                )}
              </div>
              <div className={styles.fileDetails}>
                <span className={styles.fileCategory}>
                  {f.ebook_category || f.category}
                </span>
                <h4 className={styles.fileTitle}>{f.title}</h4>
                <button 
                  onClick={() => handleDelete(f)}
                  className={styles.deleteBtn}
                  title="Excluir"
                >
                  <FiTrash2 size={16} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Gestão de Biblioteca e Modelos</h1>
        <p className={styles.pageSubtitle}>Adicione novos E-books e arquivos de modelo para todas as OSCs.</p>
      </div>
      
      <Card padding="none" className={styles.uploadCard}>
        <CardHeader title="Adicionar Novo Conteúdo" />
        <CardBody className={styles.uploadBody}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Onde este arquivo aparecerá?</label>
              <select 
                className={styles.formInput}
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value, title: ''})}
              >
                <option value="BIBLIOTECA">Biblioteca Digital (E-books)</option>
                <option value="MODELO_DOC">Modelos de Documentos (Lado Esquerdo)</option>
                <option value="MODELO_INSTITUCIONAL">Comunicação Institucional (Lado Direito)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Título do Documento</label>
              {form.category === 'MODELO_DOC' ? (
                <select 
                  className={styles.formInput}
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                >
                  <option value="">Selecione o título padrão...</option>
                  {standardTitles.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <input 
                  type="text" 
                  className={styles.formInput}
                  value={form.title}
                  placeholder="Ex: Guia de Comunicação 2026"
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                />
              )}
            </div>

            {form.category === 'BIBLIOTECA' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subcategoria (E-book)</label>
                <select 
                  className={styles.formInput}
                  value={form.ebookCategory}
                  onChange={e => setForm({...form, ebookCategory: e.target.value})}
                >
                  <option value="Governança">Governança</option>
                  <option value="Contábil">Contábil</option>
                  <option value="Manual">Manual</option>
                  <option value="E-book">E-book Geral</option>
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Arquivo (PDF ou Word)</label>
              <input 
                id="fileInput" 
                type="file" 
                accept=".pdf,.doc,.docx" 
                className={styles.formInputFile} 
                onChange={e => setForm({...form, file: e.target.files[0]})} 
                required 
              />
            </div>

            {form.category === 'BIBLIOTECA' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Capa do E-book (Obrigatório)</label>
                <input 
                  id="coverInput" 
                  type="file" 
                  accept="image/*" 
                  className={styles.formInputFile} 
                  onChange={e => setForm({...form, cover: e.target.files[0]})} 
                />
              </div>
            )}

            <div className={styles.formAction}>
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                icon={!loading && <FiUpload />}
                size="lg"
                block
              >
                {loading ? 'A processar...' : 'Publicar Conteúdo'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className={styles.contentSection}>
        <h2 className={styles.sectionTitle}>Conteúdos Publicados</h2>
        
        {renderFileSection("📚 Biblioteca Digital (E-books)", "BIBLIOTECA")}
        {renderFileSection("📄 Modelos de Documentos", "MODELO_DOC")}
        {renderFileSection("📢 Comunicação Institucional", "MODELO_INSTITUCIONAL")}

        {files.length === 0 && (
          <div className={styles.emptyState}>
            Nenhum conteúdo publicado.
          </div>
        )}
      </div>
    </div>
  );
}