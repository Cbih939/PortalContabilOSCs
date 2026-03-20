import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Spinner from '../../components/common/Spinner.jsx';

// --- Ícones para a Sanfona (Accordion) ---
const ChevronDownIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const ChevronUpIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
const MapPinIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '6px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// --- Mapeamento do Brasil (Regiões e Estados) ---
const REGIONS = {
  'Região Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  'Região Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Região Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  'Região Sudeste': ['ES', 'MG', 'RJ', 'SP'],
  'Região Sul': ['PR', 'RS', 'SC']
};

const STATE_NAMES = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 
  'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais', 
  'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
};
const STATES = Object.keys(STATE_NAMES).sort();

// Cria um dicionário inverso para descobrir rápido de que região é a UF
const UF_TO_REGION = {};
Object.entries(REGIONS).forEach(([region, ufs]) => {
  ufs.forEach(uf => { UF_TO_REGION[uf] = region; });
});

export default function ManageCertificates() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addNotification = useNotification();

  // Estados para controlar Sanfonas de REGIÃO e de ESTADO
  const [expandedEstReg, setExpandedEstReg] = useState({});
  const [expandedEstUF, setExpandedEstUF] = useState({});
  const [expandedMunReg, setExpandedMunReg] = useState({});
  const [expandedMunUF, setExpandedMunUF] = useState({});

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
      
      const reg = UF_TO_REGION[formData.state];

      // Abre automaticamente a Região e o Estado onde o link foi adicionado
      if (formData.type === 'ESTADUAL') {
        setExpandedEstReg(prev => ({...prev, [reg]: true}));
        setExpandedEstUF(prev => ({...prev, [formData.state]: true}));
      } else if (formData.type === 'MUNICIPAL') {
        setExpandedMunReg(prev => ({...prev, [reg]: true}));
        setExpandedMunUF(prev => ({...prev, [formData.state]: true}));
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

  // Funções Toggle
  const toggleEstReg = (reg) => setExpandedEstReg(prev => ({...prev, [reg]: !prev[reg]}));
  const toggleEstUF = (uf) => setExpandedEstUF(prev => ({...prev, [uf]: !prev[uf]}));
  const toggleMunReg = (reg) => setExpandedMunReg(prev => ({...prev, [reg]: !prev[reg]}));
  const toggleMunUF = (uf) => setExpandedMunUF(prev => ({...prev, [uf]: !prev[uf]}));

  // Filtros
  const federalLinks = links.filter(l => l.type === 'FEDERAL');

  // Função mágica para agrupar: Região -> UF -> Array de Links
  const groupLinksByRegionAndState = (type) => {
    const filtered = links.filter(l => l.type === type);
    const grouped = {};
    
    filtered.forEach(link => {
      const reg = UF_TO_REGION[link.state];
      if (!reg) return;
      if (!grouped[reg]) grouped[reg] = {};
      if (!grouped[reg][link.state]) grouped[reg][link.state] = [];
      grouped[reg][link.state].push(link);
    });
    
    return grouped;
  };

  const estaduais = groupLinksByRegionAndState('ESTADUAL');
  const municipais = groupLinksByRegionAndState('MUNICIPAL');

  // Conta quantos links tem numa região inteira (somando os estados)
  const countLinksInRegion = (regionObj) => {
    return Object.values(regionObj).reduce((sum, stateArray) => sum + stateArray.length, 0);
  };

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
                {STATES.map(uf => <option key={uf} value={uf}>{STATE_NAMES[uf]} ({uf})</option>)}
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
          
          {/* FEDERAIS (Sem Agrupamento) */}
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

          {/* ESTADUAIS (Agrupados por Região -> UF) */}
          <div>
            <h4 style={{ color: '#0369a1', borderBottom: '2px solid #bae6fd', paddingBottom: '8px', marginTop: 0, fontSize: '18px' }}>Links Estaduais</h4>
            {Object.keys(estaduais).length === 0 && <p style={{ fontSize: '14px', color: '#6b7280' }}>Nenhum link estadual cadastrado.</p>}
            
            {/* Loop nas Regiões que possuem dados */}
            {Object.keys(estaduais).sort().map(region => (
              <div key={region} style={{ marginBottom: '16px', border: '1px solid #bae6fd', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0f9ff' }}>
                {/* Botão da Região */}
                <button onClick={() => toggleEstReg(region)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#e0f2fe', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <MapPinIcon /> {region} 
                    <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: '10px' }}>
                      {countLinksInRegion(estaduais[region])} link(s)
                    </span>
                  </span>
                  <div style={{ color: '#0369a1' }}>{expandedEstReg[region] ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
                </button>

                {/* Sub-Sanfona dos Estados daquela Região */}
                {expandedEstReg[region] && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.keys(estaduais[region]).sort().map(uf => (
                      <div key={uf} style={{ border: '1px solid #7dd3fc', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                        <button onClick={() => toggleEstUF(uf)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fff', border: 'none', cursor: 'pointer' }}>
                          <span style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '14px' }}>
                            {STATE_NAMES[uf]} ({uf}) <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '13px', marginLeft: '6px' }}>({estaduais[region][uf].length})</span>
                          </span>
                          <div style={{ color: '#0ea5e9' }}>{expandedEstUF[uf] ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
                        </button>

                        {expandedEstUF[uf] && (
                          <div style={{ padding: '10px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            {estaduais[region][uf].map(l => (
                              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                                <div><strong style={{color: '#334155', fontSize: '14px'}}>{l.title}</strong> <br/><a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>{l.url}</a></div>
                                <button onClick={() => handleDelete(l.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Excluir</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* MUNICIPAIS (Agrupados por Região -> UF) */}
          <div>
            <h4 style={{ color: '#7e22ce', borderBottom: '2px solid #e9d5ff', paddingBottom: '8px', marginTop: 0, fontSize: '18px' }}>Links Municipais</h4>
            {Object.keys(municipais).length === 0 && <p style={{ fontSize: '14px', color: '#6b7280' }}>Nenhum link municipal cadastrado.</p>}
            
            {/* Loop nas Regiões que possuem dados */}
            {Object.keys(municipais).sort().map(region => (
              <div key={region} style={{ marginBottom: '16px', border: '1px solid #e9d5ff', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#faf5ff' }}>
                {/* Botão da Região */}
                <button onClick={() => toggleMunReg(region)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f3e8ff', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 'bold', color: '#7e22ce', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <MapPinIcon /> {region} 
                    <span style={{ backgroundColor: '#9333ea', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: '10px' }}>
                      {countLinksInRegion(municipais[region])} link(s)
                    </span>
                  </span>
                  <div style={{ color: '#7e22ce' }}>{expandedMunReg[region] ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
                </button>

                {/* Sub-Sanfona dos Estados daquela Região */}
                {expandedMunReg[region] && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.keys(municipais[region]).sort().map(uf => (
                      <div key={uf} style={{ border: '1px solid #d8b4fe', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                        <button onClick={() => toggleMunUF(uf)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fff', border: 'none', cursor: 'pointer' }}>
                          <span style={{ fontWeight: 'bold', color: '#9333ea', fontSize: '14px' }}>
                            {STATE_NAMES[uf]} ({uf}) <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '13px', marginLeft: '6px' }}>({municipais[region][uf].length})</span>
                          </span>
                          <div style={{ color: '#a855f7' }}>{expandedMunUF[uf] ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
                        </button>

                        {expandedMunUF[uf] && (
                          <div style={{ padding: '10px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            {municipais[region][uf].map(l => (
                              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                                <div>
                                  <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginRight: '6px' }}>
                                    {l.city?.toUpperCase()}
                                  </span>
                                  <strong style={{color: '#334155', fontSize: '14px'}}>{l.title}</strong> <br/>
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
                )}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}