import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './ManageLibrary.module.css';

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  
  // Estado inicial
  const [form, setForm] = useState({ 
    title: '', 
    category: 'BIBLIOTECA', 
    ebookCategory: 'Governança', 
    file: null, 
    cover: null 
  });
  
  const [loading, setLoading] = useState(false);

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
    if (!form.file) return alert("Por favor, selecione o arquivo PDF.");

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    
    // IMPORTANTE: Envia a subcategoria se for biblioteca
    if (form.category === 'BIBLIOTECA') {
       formData.append('ebook_category', form.ebookCategory);
    }

    formData.append('file', form.file);
    if (form.cover) formData.append('cover', form.cover);

    setLoading(true);
    try {
      await fileService.uploadFile(formData);
      alert("Publicado com sucesso!");
      
      setForm({ 
        title: '', 
        category: 'BIBLIOTECA', 
        ebookCategory: 'Governança', 
        file: null, 
        cover: null 
      });
      
      document.getElementById('fileInput').value = "";
      document.getElementById('coverInput').value = "";
      
      loadFiles();
    } catch (error) {
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestão de Biblioteca e Modelos</h1>
      
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Adicionar Novo Conteúdo</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* TÍTULO */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Título</label>
            <input 
              type="text" 
              className={styles.input}
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          {/* CATEGORIA PRINCIPAL */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Categoria</label>
            <select 
              className={styles.select}
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option value="BIBLIOTECA">Biblioteca (E-books)</option>
              <option value="MODELO_DOC">Modelos de Documentos</option>
              <option value="MODELO_INSTITUCIONAL">Comunicação Institucional</option>
            </select>
          </div>

          {/* SUBCATEGORIA (Visível apenas se BIBLIOTECA for selecionado) */}
          {form.category === 'BIBLIOTECA' && (
            <div className={styles.inputGroup} style={{animation: 'fadeIn 0.3s ease'}}>
              <label className={styles.label} style={{color: '#2563eb'}}>Tipo de Publicação</label>
              <select 
                className={styles.select}
                value={form.ebookCategory}
                onChange={e => setForm({...form, ebookCategory: e.target.value})}
                style={{borderColor: '#2563eb', backgroundColor: '#eff6ff'}}
              >
                <option value="Governanca">Governança</option>
                <option value="Contabil">Contábil</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          )}

          {/* ARQUIVO PDF */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Arquivo PDF</label>
            <input 
              id="fileInput"
              type="file" 
              accept=".pdf"
              className={styles.input}
              onChange={e => setForm({...form, file: e.target.files[0]})}
              required
            />
          </div>

          {/* CAPA */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Capa (Imagem)</label>
            <input 
              id="coverInput"
              type="file" 
              accept="image/*"
              className={styles.input}
              onChange={e => setForm({...form, cover: e.target.files[0]})}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Processando...' : 'Publicar Agora'}
          </button>
        </form>
      </div>

      {/* LISTA DE ARQUIVOS */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Conteúdos Publicados</h3>
        {files.length === 0 ? (
          <p className={styles.emptyText}>Nenhum conteúdo publicado.</p>
        ) : (
          <div className={styles.fileGrid}>
            {files.map(f => (
              <div key={f.id} className={styles.fileCard}>
                <div className={styles.coverWrapper}>
                  {f.cover_path ? (
                    <img src={`https://contacomigo.org.br/${f.cover_path}`} alt={f.title} className={styles.gridCover} />
                  ) : (
                    <div className={styles.placeholderCover}><span>📄</span></div>
                  )}
                </div>
                <div className={styles.fileDetails}>
                  {/* Exibe a subcategoria se existir, senão a categoria principal */}
                  <span className={styles.fileCategory}>
                    {f.ebook_category ? f.ebook_category : f.category}
                  </span>
                  <h4 className={styles.fileTitle}>{f.title}</h4>
                  <button 
                    onClick={() => { if(window.confirm("Excluir?")) fileService.deleteFile(f.id).then(loadFiles); }} 
                    className={styles.deleteBtn}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}