import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './ManageLibrary.module.css';

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    category: 'BIBLIOTECA', 
    file: null, 
    cover: null // Novo campo
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
    formData.append('file', form.file); // O PDF
    if (form.cover) {
      formData.append('cover', form.cover); // A imagem da capa
    }

    setLoading(true);
    try {
      await fileService.uploadFile(formData);
      alert("Publicado com sucesso!");
      setForm({ title: '', category: 'BIBLIOTECA', file: null, cover: null });
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

          {/* Campo do Ficheiro Principal (PDF) */}
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

          {/* NOVO: Campo da Capa (Imagem) */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Imagem da Capa (Opcional)</label>
            <input 
              id="coverInput"
              type="file" 
              accept="image/*"
              className={styles.input}
              onChange={e => setForm({...form, cover: e.target.files[0]})}
            />
            {form.cover && <p className={styles.previewText}>Capa selecionada: {form.cover.name}</p>}
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Processando...' : 'Publicar Agora'}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Capa</th>
              <th>Título</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td>
                  {f.cover_path ? (
                    <img src={`https://contacomigo.org.br/${f.cover_path}`} alt="Capa" className={styles.miniCover} />
                  ) : (
                    <span className={styles.noCover}>Sem capa</span>
                  )}
                </td>
                <td>{f.title}</td>
                <td>
                  <button onClick={() => fileService.deleteFile(f.id).then(loadFiles)} className={styles.deleteBtn}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}