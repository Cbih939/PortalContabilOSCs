import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './Messages.module.css';

const SupportIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function OSCMessagesPage() {
  const { user } = useAuth();

  // Função para suporte via E-mail (mailto)
  const handleSupportEmail = () => {
    const email = "relacionamento@redepapelsolidario.org.br";
    const subject = encodeURIComponent(`Dúvida sobre Governança - ${user?.name || 'Minha OSC'}`);
    const body = encodeURIComponent(
      "Olá,\n\n" +
      "Gostaria de suporte a respeito da Governança da minha OSC.\n\n" +
      "Detalhes da dúvida:\n"
    );
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Mensagens e Suporte</h1>
      </header>

      {/* CARD CENTRAL DE SUPORTE */}
      <div className={styles.supportCard}>
        <div className={styles.supportContent}>
          <div className={styles.supportText}>
            <h3>Ficou alguma dúvida?</h3>
            <p>
              Oferecemos suporte especializado a respeito da <strong>Governança</strong> da sua OSC. 
              Conte-nos os detalhes do seu caso e nossa equipe entrará em contato em breve.
            </p>
            <div className={styles.infoBox}>
              <span className={styles.hours}>
                <strong>Horário de funcionamento:</strong> Segunda a Sexta, das 08:00 às 17:00.
              </span>
            </div>
          </div>
          
          <button onClick={handleSupportEmail} className={styles.supportButton}>
            <SupportIcon className={styles.supportIcon} />
            Contatar Suporte por E-mail
          </button>
        </div>
      </div>

      {/* MENSAGEM AUXILIAR (OPCIONAL) */}
      <div className={styles.noticeBox}>
        <p>
          Ao clicar no botão acima, seu gerenciador de e-mail padrão será aberto com os dados de destino preenchidos.
        </p>
      </div>
    </div>
  );
}