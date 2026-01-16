import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './ManageLibrary.module.css';

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    category: 'BIBLIOTECA', 
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
    formData.append('file', form.file);
    if (form.cover) formData.append('cover', form.cover);

    setLoading(true);
    try {
      await fileService.uploadFile(formData);
      alert("Publicado com sucesso!");
      setForm({ title: '', category: 'BIBLIOTECA', file: null, cover: null });
      
      // Limpar inputs de ficheiro manualmente
      document.getElementById('fileInput').value = "";
      document.getElementById('coverInput').value = "";
      
      loadFiles();
    } catch (error) {
      alert("Erro ao enviar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestão de Biblioteca e Modelos</h1>
      
      {/* Formulário de Upload */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Adicionar Novo Conteúdo</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
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

      {/* Grelha de Conteúdos */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Conteúdos Publicados</h3>
        
        {files.length === 0 ? (
          <p style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
            Nenhum conteúdo publicado.
          </p>
        ) : (
          <div className={styles.fileGrid}>
            {files.map(f => (
              <div key={f.id} className={styles.fileCard}>
                <div className={styles.coverWrapper}>
                  {f.cover_path ? (
                    <img 
                      src={`https://contacomigo.org.br/${f.cover_path}`} 
                      alt={f.title} 
                      className={styles.gridCover} 
                    />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <span>{f.category === 'BIBLIOTECA' ? '📚' : '📄'}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.fileDetails}>
                  <span className={styles.fileCategory}>
                    {f.category.replace('_', ' ')}
                  </span>
                  <h4 className={styles.fileTitle} title={f.title}>
                    {f.title}
                  </h4>
                  
                  <button 
                    onClick={() => {
                      if(window.confirm("Deseja realmente excluir este item?")) {
                        fileService.deleteFile(f.id).then(loadFiles);
                      }
                    }} 
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