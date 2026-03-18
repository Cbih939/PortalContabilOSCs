// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AlertIcon = () => <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const HomeIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center' }}>
      <div style={{ color: '#ea580c', marginBottom: '24px' }}>
        <AlertIcon />
      </div>
      
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', lineHeight: '1' }}>404</h1>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>Página Não Encontrada</h2>
      
      <p style={{ color: '#6b7280', maxWidth: '400px', fontSize: '16px', lineHeight: '1.5', margin: '0 0 32px 0' }}>
        Oops! A página que tentou aceder não existe, foi movida ou não tem permissões para a visualizar.
      </p>
      
      <button 
        onClick={() => navigate('/')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(234, 88, 12, 0.2)' }}
      >
        <HomeIcon /> Voltar ao Início
      </button>
    </div>
  );
}