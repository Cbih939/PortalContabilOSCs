import React, { useState, useEffect } from 'react';
import * as fileService from '../../services/publicFileService.js';
import styles from './ManageLibrary.module.css';

export default function ManageLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (!form.file) return alert("Por favor, selecione o arquivo.");

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
      alert("Publicado com sucesso!");
      
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
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  // Função para renderizar uma seção específica de arquivos
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
                  // Correção da visualização da imagem com URL absoluta
                  <img 
                    src={`https://contacomigo.org.br/${f.cover_path.replace(/\\/g, '/')}`} 
                    alt={f.title} 
                    className={styles.gridCover} 
                  />
                ) : (
                  <div className={styles.placeholderCover}><span>📄</span></div>
                )}
              </div>
              <div className={styles.fileDetails}>
                <span className={styles.fileCategory}>
                  {f.ebook_category || f.category}
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
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestão de Biblioteca e Modelos</h1>
      
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Adicionar Novo Conteúdo</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Onde este arquivo aparecerá?</label>
            <select 
              className={styles.select}
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value, title: ''})}
            >
              <option value="BIBLIOTECA">Biblioteca Digital (E-books)</option>
              <option value="MODELO_DOC">Modelos de Documentos (Lado Esquerdo)</option>
              <option value="MODELO_INSTITUCIONAL">Comunicação Institucional (Lado Direito)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Título do Documento</label>
            {form.category === 'MODELO_DOC' ? (
              <select 
                className={styles.select}
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
              >
                <option value="">Selecione o título padrão (Ativa Tooltip)...</option>
                {standardTitles.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : (
              <input 
                type="text" 
                className={styles.input}
                value={form.title}
                placeholder="Ex: Guia de Comunicação 2026"
                onChange={e => setForm({...form, title: e.target.value})}
                required
              />
            )}
          </div>

          {form.category === 'BIBLIOTECA' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} style={{color: '#EC6D12'}}>Subcategoria (E-book)</label>
              <select 
                className={styles.select}
                value={form.ebookCategory}
                onChange={e => setForm({...form, ebookCategory: e.target.value})}
                style={{borderColor: '#EC6D12'}}
              >
                <option value="Governança">Governança</option>
                <option value="Contábil">Contábil</option>
                <option value="Manual">Manual</option>
                <option value="E-book">E-book Geral</option>
              </select>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Arquivo (PDF ou Word)</label>
            <input 
              id="fileInput" 
              type="file" 
              // Atualizado para aceitar PDF e formatos Word
              accept=".pdf,.doc,.docx" 
              className={styles.input} 
              onChange={e => setForm({...form, file: e.target.files[0]})} 
              required 
            />
          </div>

          {form.category === 'BIBLIOTECA' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Capa do E-book (Obrigatório para Biblioteca)</label>
              <input id="coverInput" type="file" accept="image/*" className={styles.input} onChange={e => setForm({...form, cover: e.target.files[0]})} />
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'A processar...' : 'Publicar Agora'}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Conteúdos Publicados</h2>
        
        {/* Renderização por Categorias Separadas */}
        {renderFileSection("📚 Biblioteca Digital (E-books)", "BIBLIOTECA")}
        {renderFileSection("📄 Modelos de Documentos", "MODELO_DOC")}
        {renderFileSection("📢 Comunicação Institucional", "MODELO_INSTITUCIONAL")}

        {files.length === 0 && (
          <p className={styles.emptyText}>Nenhum conteúdo publicado.</p>
        )}
      </div>
    </div>
  );
}