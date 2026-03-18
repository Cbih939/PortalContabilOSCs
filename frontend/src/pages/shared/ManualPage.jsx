import React from 'react';
import { Link } from 'react-router-dom';

export default function ManualPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
      {/* Navbar Minimalista */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo_portal.png" alt="Conta Comigo" style={{ height: '40px' }} />
          <h1 style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: 'bold' }}>Portal de Guias</h1>
        </div>
        <Link to="/login" style={{ color: '#ea580c', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>&larr; Voltar ao Início</Link>
      </nav>

      {/* Conteúdo Principal */}
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '24px' }}>Manual de Gestão e Regularidade</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px', lineHeight: '1.5', maxWidth: '600px' }}>
                Guia oficial de onboarding para Associações sem Fins Lucrativos, OSCs, OSCIPs e Cooperativas. Aprenda as melhores práticas de formalização e utilização da nossa plataforma.
              </p>
            </div>
            
            {/* Botão de Download puxando o PDF da pasta Public raiz */}
            <a 
              href="/MANUAL_CONTA_COMIGO_COMPLETO.pdf" 
              download="Manual_Conta_Comigo.pdf"
              style={{ backgroundColor: '#ea580c', color: '#fff', padding: '12px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Baixar PDF
            </a>
          </div>

          <div style={{ width: '100%', height: '70vh', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe 
              src="/MANUAL_CONTA_COMIGO_COMPLETO.pdf" 
              title="Manual Conta Comigo"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}