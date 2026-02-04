import React from 'react';
import styles from './Login.module.css'; // Reaproveitando estilos de centralização

export default function ManutencaoPage() {
  return (
    <div className={styles.loginCard} style={{ textAlign: 'center' }}>
      <img src="/logo_portal.png" alt="Logo" className={styles.logo} />
      <h2 style={{ color: '#EC6D12' }}>Estamos em Manutenção</h2>
      <p>O Portal Contábil está passando por atualizações para melhor atendê-lo.</p>
      <p><strong>Previsão de retorno:</strong> Em alguns minutos.</p>
      <div style={{ marginTop: '2rem', fontSize: '3rem' }}>🛠️</div>
    </div>
  );
}