import React from 'react';

export default function ManutencaoPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <img src="/logo_portal.png" alt="Logo" style={{ width: '150px', marginBottom: '20px' }} />
      <h1 style={{ color: '#EC6D12' }}>Portal em Atualização</h1>
      <p>Estamos a realizar melhorias técnicas. Voltamos já!</p>
    </div>
  );
}