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
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) return alert("Selecione um arquivo");
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('file', form.file);

    setLoading(true);
    try {
      await fileService.uploadFile(formData);
      alert("Arquivo enviado com sucesso!");
      setForm({ title: '', category: 'BIBLIOTECA', file: null });
      
      // Limpa o input de arquivo visualmente
      document.getElementById('fileInput').value = "";
      
      loadFiles();
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;
    try {
      await fileService.deleteFile(id);
      loadFiles();
    } catch (e) {
      alert("Erro ao deletar arquivo.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestão de Biblioteca e Modelos</h1>
      
      {/* Formulário de Upload */}
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
              placeholder="Ex: Manual de Procedimentos 2025"
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

      {/* Lista de Arquivos */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Arquivos Publicados</h3>
        
        <div className={styles.tableContainer}>
            <table className={styles.table}>
            <thead>
                <tr>
                <th className={styles.th}>Título</th>
                <th className={styles.th}>Categoria</th>
                <th className={styles.th}>Data Upload</th>
                <th className={styles.th}>Ações</th>
                </tr>
            </thead>
            <tbody>
                {files.length === 0 ? (
                    <tr>
                        <td colSpan="4" className={styles.td} style={{textAlign: 'center', color: '#999'}}>
                            Nenhum arquivo encontrado.
                        </td>
                    </tr>
                ) : (
                    files.map(file => (
                    <tr key={file.id}>
                        <td className={styles.td}>{file.title}</td>
                        <td className={styles.td}>
                            {file.category === 'BIBLIOTECA' && 'Biblioteca'}
                            {file.category === 'MODELO_DOC' && 'Modelo Doc.'}
                            {file.category === 'MODELO_INSTITUCIONAL' && 'Inst.'}
                        </td>
                        <td className={styles.td}>
                            {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className={styles.td}>
                            <button onClick={() => handleDelete(file.id)} className={styles.deleteButton}>
                                Excluir
                            </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}