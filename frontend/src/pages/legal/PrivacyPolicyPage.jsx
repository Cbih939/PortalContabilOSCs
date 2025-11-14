// src/pages/legal/PrivacyPolicyPage.jsx
import React from 'react';
import styles from './LegalPage.module.css'; // Reutiliza o CSS

export default function PrivacyPolicyPage() {
  return (
    // Nota: O GuestLayout já centraliza esta página
    <div className={styles.card}>
      <h1 className={styles.title}>Política de Privacidade</h1>
      <p className={styles.lastUpdated}>Última atualização: 31 de Outubro de 2025</p>
      
      <div className={styles.content}>
        <p className={styles.disclaimer}>
          <strong>AVISO IMPORTANTE:</strong> Este texto é um modelo (placeholder) e não possui validade legal. Substitua este conteúdo por uma política de privacidade real, redigida por um consultor jurídico qualificado, que reflita as práticas de coleta e uso de dados da sua aplicação e esteja em conformidade com a LGPD (Lei Geral de Proteção de Dados).
        </p>

        <h2>1. Coleta de Informações</h2>
        <p>Coletamos informações que você nos fornece diretamente ao se cadastrar, como nome, email, CPF/CNPJ e informações de contato. Também coletamos os ficheiros (documentos, ATAs, estatutos, logos) que você envia através da plataforma.</p>

        <h2>2. Uso das Informações</h2>
        <p>As informações coletadas são usadas exclusivamente para:</p>
        <ul>
          <li>Fornecer, operar e manter os nossos serviços (ex: permitir a comunicação entre a OSC e o Contador).</li>
          <li>Processar transações (uploads, envios de mensagens, envio de alertas).</li>
          <li>Melhorar, personalizar e expandir os nossos serviços.</li>
          <li>Comunicar consigo para atendimento ao cliente e fornecimento de atualizações.</li>
        </ul>

        <h2>3. Compartilhamento de Informações</h2>
        <p>Não compartilhamos as suas informações pessoais com terceiros, exceto conforme descrito nesta política. As suas informações (documentos, mensagens) são compartilhadas apenas com o seu Contador designado (se for uma OSC) ou com as OSCs designadas (se for um Contador).</p>
        
        <h2>4. Segurança dos Dados</h2>
        <p>Implementamos medidas de segurança para proteger os seus dados, incluindo o uso de criptografia para senhas (hashing) e conexões seguras (HTTPS). Nenhum sistema é 100% seguro.</p>
        
        <h2>5. Seus Direitos (LGPD)</h2>
        <p>Você tem o direito de aceder, corrigir, atualizar ou solicitar a exclusão das suas informações pessoais. Para exercer esses direitos, por favor, entre em contato conosco através dos nossos canais oficiais.</p>
      </div>
    </div>
  );
}