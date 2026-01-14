import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './ManageLibrary.module.css';

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'BIBLIOTECA', file: null });
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
    if (!form.file) return alert("Por favor, selecione um arquivo.");
    
    // Criando o FormData corretamente
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('file', form.file); // O nome 'file' deve coincidir com o backend

    setLoading(true);
    try {
      await fileService.uploadFile(formData);
      alert("Arquivo enviado com sucesso!");
      
      // Resetar form
      setForm({ title: '', category: 'BIBLIOTECA', file: null });
      if (document.getElementById('fileInput')) {
        document.getElementById('fileInput').value = "";
      }
      
      loadFiles();
    } catch (error) {
      console.error("Erro no envio:", error);
      alert("Erro ao enviar arquivo. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestão de Biblioteca e Modelos</h1>
      
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Adicionar Novo Arquivo</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Título do Arquivo</label>
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
            <label className={styles.label}>Arquivo</label>
            <input 
              id="fileInput"
              type="file" 
              className={styles.input}
              onChange={e => setForm({...form, file: e.target.files[0]})}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Enviando...' : 'Publicar Arquivo'}
          </button>
        </form>
      </div>

      {/* Tabela simplificada para brevidade */}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td>{f.title}</td>
                <td>
                  <button onClick={() => fileService.deleteFile(f.id).then(loadFiles)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}