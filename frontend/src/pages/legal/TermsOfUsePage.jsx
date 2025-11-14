// src/pages/legal/TermsOfUsePage.jsx
import React from 'react';
import styles from './LegalPage.module.css'; // Reutiliza o CSS

export default function TermsOfUsePage() {
  return (
    // Nota: O GuestLayout já centraliza esta página
    <div className={styles.card}>
      <h1 className={styles.title}>Termos de Uso</h1>
      <p className={styles.lastUpdated}>Última atualização: 31 de Outubro de 2025</p>

      <div className={styles.content}>
        <p className={styles.disclaimer}>
          <strong>AVISO IMPORTANTE:</strong> Este texto é um modelo (placeholder) e não possui validade legal. Substitua este conteúdo por termos de uso reais, redigidos por um consultor jurídico qualificado, que definam as regras de utilização da sua plataforma.
        </p>

        <h2>1. Aceitação dos Termos</h2>
        <p>Ao aceder e utilizar o Portal Contábil OSCs ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se não concordar com estes termos, não utilize o serviço.</p>

        <h2>2. Descrição do Serviço</h2>
        <p>O Serviço fornece uma plataforma de comunicação e gestão de documentos entre Organizações da Sociedade Civil (OSCs) e os seus prestadores de serviços de contabilidade ("Contadores").</p>

        <h2>3. Obrigações do Utilizador</h2>
        <p>Você concorda em usar o Serviço apenas para fins legais. Você é responsável por manter a confidencialidade da sua senha e conta. Você concorda em:</p>
        <ul>
          <li>Fornecer informações verdadeiras, precisas e completas durante o registo.</li>
          <li>Não fazer upload de conteúdo ilegal, malicioso ou que viole direitos de terceiros.</li>
          <li>Não tentar obter acesso não autorizado ao sistema.</li>
        </ul>

        <h2>4. Propriedade Intelectual</h2>
        <p>O conteúdo que você envia (documentos, mensagens) permanece sua propriedade. Você nos concede uma licença limitada para armazenar, processar e exibir esse conteúdo com o único propósito de operar o Serviço.</p>
        
        <h2>5. Limitação de Responsabilidade</h2>
        <p>O Serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos ou indiretos resultantes do uso ou da incapacidade de usar o serviço.</p>
        
        <h2>6. Modificações dos Termos</h2>
        <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações publicando os novos termos no site.</p>
      </div>
    </div>
  );
}