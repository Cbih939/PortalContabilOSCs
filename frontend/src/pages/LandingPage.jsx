import React from 'react';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      
      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextContainer}>
            <img 
              src="https://redepapelsolidario.org.br/wp-content/uploads/2026/09/logo.png" 
              alt="Pedroso Rabelo Contabilidade" 
              className={styles.heroLogo} 
            />
            <h1 className={styles.heroTitle}>Conta Comigo</h1>
            <h2 className={styles.heroSubtitle}>O aplicativo que te<br/>acompanha em todos<br/>os processos.</h2>
            <p className={styles.heroText}>
              A ferramenta definitiva para quem quer abrir, organizar e fortalecer uma ONG com segurança, eficiência e propósito. Caminhe com quem entende de transformação social.
            </p>
            <a href="https://contacomigo.org.br/login" className={styles.heroBtn}>
              Começar minha jornada &rarr;
            </a>
          </div>
          <div className={styles.heroImageContainer}>
            <img 
              src="https://redepapelsolidario.org.br/wp-content/uploads/2026/02/banner-header.png" 
              alt="Conta Comigo App Devices" 
              className={styles.heroMainImg} 
            />
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className={styles.whySection}>
        <div className={styles.whyHeader}>
          <h2>Por que o <span className={styles.highlight}>CONTA COMIGO</span> é indispensável?</h2>
          <p className={styles.quote}>“Transformar vidas exige mais do que intenção.”</p>
          <p className={styles.whySub}>
            O CONTA COMIGO resolve o que impede a maioria das organizações de crescer:<br/>
            a falta de gestão estruturada, contabilidade segura e comunicação estratégica.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-5 5"/></svg>
            </div>
            <h3>Contabilidade Completa</h3>
            <p>Organizada por área de atuação e seguindo normas do terceiro setor (ITG 2002).</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3>Blindagem Jurídica</h3>
            <p>Classificação correta de receitas e despesas. Evite autuações e riscos com auditorias.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            </div>
            <h3>Prestação de Contas</h3>
            <p>Demonstrações prontas para conselhos, fundos, editais e grandes parceiros.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <h3>Biblioteca Premium</h3>
            <p>E-books exclusivos sobre gestão, governança e captação de recursos.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h3>Gestão Integrada</h3>
            <p>Diretoria, voluntários, projetos e documentos em um só lugar.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <h3>Comunicação Estratégica</h3>
            <p>Modelos prontos e o manual 'Segredos da Comunicação' para captar recursos.</p>
          </div>
        </div>
      </section>

      {/* TARGET SECTION */}
      <section className={styles.targetSection} style={{ backgroundImage: `url('https://redepapelsolidario.org.br/wp-content/uploads/2026/02/BANNER-scaled.png')` }}>
        <div className={styles.targetContent}>
          <div className={styles.targetText}>
            <h2>Para quem é o<br/>CONTA COMIGO?</h2>
            <p className={styles.targetDesc}>
              Desenvolvemos uma solução que elimina erros, reduz riscos e coloca sua ONG no mesmo nível de excelência das grandes instituições.
            </p>
            <ul className={styles.targetList}>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Quem quer abrir uma ONG do zero com proteção jurídica.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Organizações que precisam melhorar a gestão e evitar riscos.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Quem deseja captar mais recursos com transparência.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Líderes que buscam profissionalismo e tecnologia.
              </li>
            </ul>
            <a href="https://wa.me/5511964369720?text=Ol%C3%A1%20vim%20do%20Portal%20Conta%20Comigo%2C%20e%20gostaria%20de%20saber%20mais" target="_blank" rel="noopener noreferrer" className={styles.targetBtn}>
              Saiba mais
            </a>
          </div>
        </div>
      </section>

      {/* LIBRARY SECTION */}
      <section className={styles.librarySection}>
        <div className={styles.libraryContainer}>
          <div className={styles.libraryImageWrapper}>
            <img 
              src="https://redepapelsolidario.org.br/wp-content/uploads/2026/02/tablet-1024x796.png" 
              alt="Conta Comigo Dashboard" 
              className={styles.libraryImg}
            />
          </div>
          <div className={styles.libraryCard}>
            <h3>Biblioteca Exclusiva</h3>
            <p className={styles.libraryCardSub}>Acesso a conteúdos que ensinam gestão na prática, sempre atualizados.</p>
            
            <div className={styles.libraryBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              <div>
                <strong>Manual Segredos da Comunicação</strong>
                <span>A chave para financiamento contínuo</span>
              </div>
            </div>
            
            <div className={styles.libraryBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              <div>
                <strong>Guia de Abertura Segura</strong>
                <span>Do estatuto ao CNPJ</span>
              </div>
            </div>

            <div className={styles.libraryAction}>
              <a href="https://wa.me/5511964369720?text=Ol%C3%A1%20vim%20do%20Portal%20Conta%20Comigo%2C%20e%20gostaria%20de%20saber%20mais" target="_blank" rel="noopener noreferrer" className={styles.orangeBtn}>
                Saiba mais
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingHeaderTop}>
          <img 
            src="https://redepapelsolidario.org.br/wp-content/uploads/2026/02/CONTA-COMIGO-LOGO-pequeno.png" 
            alt="Conta Comigo" 
            className={styles.pricingLogo} 
          />
          <h2 className={styles.pricingTitle}>
            Gestão <span className={styles.highlight}>completa</span><br/>
            para a sua <span className={styles.highlight}>OSC</span>
          </h2>
        </div>
        <p className={styles.pricingSub}>
          Você não está mais sozinho. Tenha o apoio que a sua organização precisa com um valor que cabe no seu orçamento.
        </p>
        
        <div className={styles.pricingCard}>
          <div className={styles.pricingTop}>
            R$ 339,00
          </div>
          <div className={styles.pricingBody}>
            <ul className={styles.pricingList}>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Contabilidade completa (ITG 2002)
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Relatórios e documentos automáticos
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Biblioteca de E-books e Modelos
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Gestão de voluntários e projetos
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Guias de abertura e regularização
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Envio de até 20 documentos contábeis
              </li>
            </ul>
            <div className={styles.pricingBtnContainer}>
              <a href="https://contacomigo.org.br/register-osc" className={styles.pricingBtn}>
                Cadastrar
              </a>
            </div>
            <div className={styles.pricingFooter}>
              <p>Cancelamento a qualquer momento.<br/>Suporte incluso.</p>
            </div>
            <div className={styles.pricingRabeloWrapper}>
              <img 
                src="https://redepapelsolidario.org.br/wp-content/uploads/2026/09/logo.png" 
                alt="Pedroso Rabelo Contabilidade" 
                className={styles.pricingRabeloLogo} 
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
