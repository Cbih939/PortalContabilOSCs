import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import styles from './ManageCertificates.module.css';

import { FiChevronDown, FiChevronUp, FiMapPin, FiPlus, FiTrash2, FiFileText } from 'react-icons/fi';

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

const UF_TO_REGION = {};
Object.entries(REGIONS).forEach(([region, ufs]) => {
  ufs.forEach(uf => { UF_TO_REGION[uf] = region; });
});

export default function ManageCertificates() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addNotification = useNotification();

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

  const toggleEstReg = (reg) => setExpandedEstReg(prev => ({...prev, [reg]: !prev[reg]}));
  const toggleEstUF = (uf) => setExpandedEstUF(prev => ({...prev, [uf]: !prev[uf]}));
  const toggleMunReg = (reg) => setExpandedMunReg(prev => ({...prev, [reg]: !prev[reg]}));
  const toggleMunUF = (uf) => setExpandedMunUF(prev => ({...prev, [uf]: !prev[uf]}));

  const federalLinks = links.filter(l => l.type === 'FEDERAL');

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

  const countLinksInRegion = (regionObj) => {
    return Object.values(regionObj).reduce((sum, stateArray) => sum + stateArray.length, 0);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Gestão de Certificadoras</h1>
        <p className={styles.pageSubtitle}>Cadastre os links oficiais para emissão de certidões. As OSCs verão automaticamente os links baseados na localização delas.</p>
      </div>

      <div className={styles.formContainer}>
        <h3 className={styles.formTitle}>Adicionar Novo Link</h3>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Regime da Certidão</label>
            <select className={styles.formSelect} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="FEDERAL">Federal (Aparece para todas as OSCs)</option>
              <option value="ESTADUAL">Estadual (Filtra por Estado)</option>
              <option value="MUNICIPAL">Municipal (Filtra por Estado e Município)</option>
            </select>
          </div>

          {(formData.type === 'ESTADUAL' || formData.type === 'MUNICIPAL') ? (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado (UF)</label>
              <select className={styles.formSelect} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                <option value="">Selecione o Estado...</option>
                {STATES.map(uf => <option key={uf} value={uf}>{STATE_NAMES[uf]} ({uf})</option>)}
              </select>
            </div>
          ) : <div />}

          {formData.type === 'MUNICIPAL' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Município</label>
              <input className={styles.formInput} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Ex: São Paulo" />
            </div>
          )}

          <div className={styles.formGroupFull}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Título do Link (Ex: Certidão FGTS)</label>
              <input className={styles.formInput} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Digite o título" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL (Ex: https://...)</label>
              <input className={styles.formInput} value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://" />
            </div>
          </div>

          <div className={styles.submitWrapper}>
            <Button type="submit" variant="primary" icon={<FiPlus />} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Adicionar Link'}
            </Button>
          </div>
        </form>
      </div>

      {isLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner text="Carregando links..." /></div> : (
        <div className={styles.listContainer}>
          
          <div>
            <h4 className={`${styles.sectionHeading} ${styles.headingFederal}`}>
              <FiFileText /> Links Federais
            </h4>
            {federalLinks.map(l => (
              <div key={l.id} className={styles.linkCard}>
                <div className={styles.linkInfo}>
                  <div className={styles.linkTitle}>{l.title}</div>
                  <a href={l.url} target="_blank" rel="noreferrer" className={styles.linkUrl}>{l.url}</a>
                </div>
                <button onClick={() => handleDelete(l.id)} className={styles.deleteBtn}>Excluir</button>
              </div>
            ))}
            {federalLinks.length === 0 && <p className={styles.emptyText}>Nenhum link federal cadastrado.</p>}
          </div>

          <div>
            <h4 className={`${styles.sectionHeading} ${styles.headingEstadual}`}>
              <FiFileText /> Links Estaduais
            </h4>
            {Object.keys(estaduais).length === 0 && <p className={styles.emptyText}>Nenhum link estadual cadastrado.</p>}
            
            {Object.keys(estaduais).sort().map(region => (
              <div key={region} className={`${styles.regionBlock} ${styles.estadual}`}>
                <button onClick={() => toggleEstReg(region)} className={styles.regionHeader}>
                  <div className={styles.regionTitle}>
                    <FiMapPin className={styles.regionIcon} /> {region} 
                    <span className={styles.countBadge}>{countLinksInRegion(estaduais[region])} link(s)</span>
                  </div>
                  <div style={{ color: 'var(--color-info)' }}>{expandedEstReg[region] ? <FiChevronUp /> : <FiChevronDown />}</div>
                </button>

                {expandedEstReg[region] && (
                  <div className={styles.regionBody}>
                    {Object.keys(estaduais[region]).sort().map(uf => (
                      <div key={uf} className={styles.stateBlock}>
                        <button onClick={() => toggleEstUF(uf)} className={styles.stateHeader}>
                          <div className={styles.stateTitle}>
                            {STATE_NAMES[uf]} ({uf}) <span className={styles.stateCount}>({estaduais[region][uf].length})</span>
                          </div>
                          <div style={{ color: '#0ea5e9' }}>{expandedEstUF[uf] ? <FiChevronUp /> : <FiChevronDown />}</div>
                        </button>

                        {expandedEstUF[uf] && (
                          <div className={styles.stateBody}>
                            {estaduais[region][uf].map(l => (
                              <div key={l.id} className={styles.linkCard}>
                                <div className={styles.linkInfo}>
                                  <div className={styles.linkTitle}>{l.title}</div>
                                  <a href={l.url} target="_blank" rel="noreferrer" className={styles.linkUrl}>{l.url}</a>
                                </div>
                                <button onClick={() => handleDelete(l.id)} className={styles.deleteBtn}>Excluir</button>
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

          <div>
            <h4 className={`${styles.sectionHeading} ${styles.headingMunicipal}`}>
              <FiFileText /> Links Municipais
            </h4>
            {Object.keys(municipais).length === 0 && <p className={styles.emptyText}>Nenhum link municipal cadastrado.</p>}
            
            {Object.keys(municipais).sort().map(region => (
              <div key={region} className={`${styles.regionBlock} ${styles.municipal}`}>
                <button onClick={() => toggleMunReg(region)} className={styles.regionHeader}>
                  <div className={styles.regionTitle}>
                    <FiMapPin className={styles.regionIcon} /> {region} 
                    <span className={styles.countBadge}>{countLinksInRegion(municipais[region])} link(s)</span>
                  </div>
                  <div style={{ color: '#7e22ce' }}>{expandedMunReg[region] ? <FiChevronUp /> : <FiChevronDown />}</div>
                </button>

                {expandedMunReg[region] && (
                  <div className={styles.regionBody}>
                    {Object.keys(municipais[region]).sort().map(uf => (
                      <div key={uf} className={styles.stateBlock}>
                        <button onClick={() => toggleMunUF(uf)} className={styles.stateHeader}>
                          <div className={styles.stateTitle}>
                            {STATE_NAMES[uf]} ({uf}) <span className={styles.stateCount}>({municipais[region][uf].length})</span>
                          </div>
                          <div style={{ color: '#a855f7' }}>{expandedMunUF[uf] ? <FiChevronUp /> : <FiChevronDown />}</div>
                        </button>

                        {expandedMunUF[uf] && (
                          <div className={styles.stateBody}>
                            {municipais[region][uf].map(l => (
                              <div key={l.id} className={styles.linkCard}>
                                <div className={styles.linkInfo}>
                                  <div className={styles.linkTitle}>
                                    <span className={styles.cityBadge}>{l.city?.toUpperCase()}</span>
                                    {l.title}
                                  </div>
                                  <a href={l.url} target="_blank" rel="noreferrer" className={styles.linkUrl}>{l.url}</a>
                                </div>
                                <button onClick={() => handleDelete(l.id)} className={styles.deleteBtn}>Excluir</button>
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