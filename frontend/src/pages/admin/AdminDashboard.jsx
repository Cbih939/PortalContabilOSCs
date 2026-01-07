import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css'; // Reutilize ou crie um CSS básico

// Componentes de Ícones simples
const UserIcon = () => <span>👥</span>;
const BuildingIcon = () => <span>🏢</span>;
const FileIcon = () => <span>📂</span>;

export default function AdminDashboard() {
  // Você pode buscar estatísticas reais aqui futuramente
  const stats = [
    { title: 'Total de Usuários', value: '7', icon: UserIcon, color: '#e0e7ff', textColor: '#4338ca' },
    { title: 'OSCs Cadastradas', value: '5', icon: BuildingIcon, color: '#dcfce7', textColor: '#15803d' },
    { title: 'Arquivos Publicados', value: '12', icon: FileIcon, color: '#ffedd5', textColor: '#c2410c' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#111827' }}>Dashboard do Administrador</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: stat.color, padding: '1rem', borderRadius: '50%', color: stat.textColor, display: 'flex' }}>
              <stat.icon />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{stat.title}</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>Ações Rápidas</h3>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          <Link to="/admin/usuarios" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              <UserIcon /> Gerenciar Usuários
            </button>
          </Link>

          <Link to="/admin/oscs" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              <BuildingIcon /> Gerenciar OSCs
            </button>
          </Link>
          
          {/* NOVO BOTÃO */}
          <Link to="/admin/biblioteca" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              <FileIcon /> Biblioteca e Modelos
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}