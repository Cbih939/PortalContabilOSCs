import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './ManageLibrary.module.css'; // Crie um CSS básico para tabela e form

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'BIBLIOTECA', file: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      // Carrega tudo sem filtro
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
      alert("Arquivo enviado!");
      setForm({ title: '', category: 'BIBLIOTECA', file: null });
      loadFiles();
    } catch (error) {
      alert("Erro ao enviar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Tem certeza?")) return;
    try {
      await fileService.deleteFile(id);
      loadFiles();
    } catch (e) {
      alert("Erro ao deletar");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gestão de Biblioteca e Modelos</h1>
      
      {/* Formulário de Upload */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>Adicionar Novo Arquivo</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label>Título do Arquivo</label>
            <input 
              type="text" 
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
              style={{ display: 'block', padding: '8px' }}
            />
          </div>
          <div>
            <label>Categoria</label>
            <select 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
              style={{ display: 'block', padding: '8px' }}
            >
              <option value="BIBLIOTECA">Biblioteca (E-books)</option>
              <option value="MODELO_DOC">Modelos de Documentos</option>
              <option value="MODELO_INSTITUCIONAL">Comunicação Institucional</option>
            </select>
          </div>
          <div>
            <label>Arquivo</label>
            <input 
              type="file" 
              onChange={e => setForm({...form, file: e.target.files[0]})}
              required
              style={{ display: 'block' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#EC6D12', color: 'white', border: 'none', borderRadius: '4px' }}>
            {loading ? 'Enviando...' : 'Publicar'}
          </button>
        </form>
      </div>

      {/* Lista de Arquivos */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>Arquivos Publicados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '8px' }}>Título</th>
              <th style={{ padding: '8px' }}>Categoria</th>
              <th style={{ padding: '8px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '8px' }}>{file.title}</td>
                <td style={{ padding: '8px' }}>{file.category}</td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => handleDelete(file.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}