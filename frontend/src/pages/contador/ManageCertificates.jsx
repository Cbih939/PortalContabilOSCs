import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// --- Ícones para a Sanfona (Accordion) ---
const ChevronDownIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const ChevronUpIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function ManageCertificates() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addNotification = useNotification();

  // Estados para controlar as Sanfonas (Accordions) abertas
  const [expandedEstadual, setExpandedEstadual] = useState({});
  const [expandedMunicipal, setExpandedMunicipal] = useState({});

  const [formData, setFormData] = useState({
    type: 'FEDERAL', state: '', city: '', title: '', url: ''
  });

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/certificates');
      setLinks(data);
    } catch (err) {
      addNotification('Erro ao carregar os links.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return addNotification('Preencha o título e a URL.', 'warning');
    if (formData.type === 'ESTADUAL' && !formData.state) return addNotification('Selecione o Estado.', 'warning');
    if (formData.type === 'MUNICIPAL' && (!formData.state || !formData.city)) return addNotification('Informe o Estado e o Município.', 'warning');

    setIsSubmitting(true);
    try {
      await api.post('/certificates', formData);
      addNotification('Link cadastrado com sucesso!', 'success');
      
      // Se cadastrar um estadual/municipal, abre a sanfona correspondente para ele ver o resultado
      if (formData.type === 'ESTADUAL') {
        setExpandedEstadual(prev => ({...prev, [formData.state]: true}));
      } else if (formData.type === 'MUNICIPAL') {
        setExpandedMunicipal(prev => ({...prev, [formData.state]: true}));
      }

      setFormData({ type: 'FEDERAL', state: '', city: '', title: '', url: '' });
      fetchLinks();
    } catch (err) {
      addNotification('Erro ao cadastrar link.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este link do sistema?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      addNotification('Link removido!', 'success');
      fetchLinks();
    } catch (err) {
      addNotification('Erro ao remover.', 'error');
    }
  };

  // Funções de Toggle (Abrir/Fechar)
  const toggleEstadual = (uf) => setExpandedEstadual(prev => ({...prev, [uf]: !prev[uf]}));
  const toggleMunicipal = (uf) => setExpandedMunicipal(prev => ({...prev, [uf]: !prev[uf]}));

  // Agrupamento para exibição
  const federalLinks = links.filter(l => l.type === 'FEDERAL');
  
  // Agrupa os links estaduais por Estado (UF)
  const groupedEstaduais = links.filter(l => l.type === 'ESTADUAL').reduce((acc, link) => {
    acc[link.state] = acc[link.state] || [];
    acc[link.state].push(link);
    return acc;
  }, {});

  // Agrupa os links municipais por Estado (UF)
  const groupedMunicipais = links.filter(l => l.type === 'MUNICIPAL').reduce((acc, link) => {
    acc[link.state] = acc[link.state] || [];
    acc[link.state].push(link);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '20px' }}>Gestão de Certificadoras</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Cadastre os links oficiais para emissão de certidões. As OSCs verão automaticamente os links baseados na localização delas.</p>

      {/* FORMULÁRIO DE CADASTRO */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#374151' }}>Adicionar Novo Link</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Regime da Certidão</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="FEDERAL">Federal (Aparece para todas as OSCs)</option>
              <option value="ESTADUAL">Estadual (Filtra por Estado)</option>
              <option value="MUNICIPAL">Municipal (Filtra por Estado e Município)</option>
            </select>
          </div>

          {(formData.type === 'ESTADUAL' || formData.type === 'MUNICIPAL') ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Estado (UF)</label>
              <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                <option value="">Selecione o Estado...</option>
                {STATES.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          ) : <div />}

          {formData.type === 'MUNICIPAL' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Município</label>
              <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Ex: São Paulo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
            <Input label="Título do Link (Ex: Certidão FGTS)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <Input label="URL (Ex: https://...)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Adicionar Link'}</Button>
          </div>
        </form>
      </div>

      {/* LISTAGEM DOS LINKS */}
      {isLoading ? <Spinner text="A carregar links..." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* FEDERAIS (Lista Simples, pois não agrupam por estado) */}
          <div>
            <h4 style={{ color: '#15803d', borderBottom: '2px solid #bbf7d0', paddingBottom: '8px', marginTop: 0, fontSize: '18px' }}>Links Federais</h4>
            {federalLinks.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '10px', alignItems: 'center' }}>
                <div><strong style={{color: '#1f2937'}}>{l.title}</strong> <br/><a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>{l.url}</a></div>
                <button onClick={() => handleDelete(l.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
              </div>
            ))}
            {federalLinks.length === 0 && <p style={{ fontSize: '14px', color: '#6b7280' }}>Nenhum link federal cadastrado.</p>}
          </div>

          {/* ESTADUAIS (Agrupados por Estado) */}
          <div>
            <h4 style={{ color: '#0369a1', borderBottom: '2px solid #bae6fd', paddingBottom: '8px', marginTop: 0, fontSize: '18px' }}>Links Estaduais</h4>
            {Object.keys(groupedEstaduais).length === 0 && <p style={{ fontSize: '14px', color: '#6b7280' }}>Nenhum link estadual cadastrado.</p>}
            
            {Object.keys(groupedEstaduais).sort().map(uf => (
              <div key={uf} style={{ marginBottom: '12px', border: '1px solid #bae6fd', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                {/* Botão da Sanfona */}
                <button 
                  onClick={() => toggleEstadual(uf)} 
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#f0f9ff', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '15px' }}>
                    Estado: {uf} <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: '8px' }}>{groupedEstaduais[uf].length} link(s)</span>
                  </span>
                  <div style={{ color: '#0369a1' }}>
                    {expandedEstadual[uf] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </div>
                </button>

                {/* Conteúdo da Sanfona */}
                {expandedEstadual[uf] && (
                  <div style={{ padding: '10px 16px' }}>
                    {groupedEstaduais[uf].map(l => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div><strong style={{color: '#334155'}}>{l.title}</strong> <br/><a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>{l.url}</a></div>
                        <button onClick={() => handleDelete(l.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Excluir</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* MUNICIPAIS (Agrupados por Estado) */}
          <div>
            <h4 style={{ color: '#7e22ce', borderBottom: '2px solid #e9d5ff', paddingBottom: '8px', marginTop: 0, fontSize: '18px' }}>Links Municipais</h4>
            {Object.keys(groupedMunicipais).length === 0 && <p style={{ fontSize: '14px', color: '#6b7280' }}>Nenhum link municipal cadastrado.</p>}
            
            {Object.keys(groupedMunicipais).sort().map(uf => (
              <div key={uf} style={{ marginBottom: '12px', border: '1px solid #e9d5ff', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                {/* Botão da Sanfona */}
                <button 
                  onClick={() => toggleMunicipal(uf)} 
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#faf5ff', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 'bold', color: '#7e22ce', fontSize: '15px' }}>
                    Estado: {uf} <span style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: '8px' }}>{groupedMunicipais[uf].length} link(s)</span>
                  </span>
                  <div style={{ color: '#7e22ce' }}>
                    {expandedMunicipal[uf] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </div>
                </button>

                {/* Conteúdo da Sanfona */}
                {expandedMunicipal[uf] && (
                  <div style={{ padding: '10px 16px' }}>
                    {groupedMunicipais[uf].map(l => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '6px' }}>
                            MUNICÍPIO: {l.city?.toUpperCase()}
                          </span>
                          <strong style={{color: '#334155'}}>{l.title}</strong> <br/>
                          <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>{l.url}</a>
                        </div>
                        <button onClick={() => handleDelete(l.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Excluir</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}