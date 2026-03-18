// src/pages/osc/Help.jsx
import React from 'react';

// Ícones
const SupportIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MailIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FAQIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function HelpPage() {
  const faqs = [
    { q: 'Como envio os meus documentos mensais?', a: 'Vá à secção "Meus Documentos", escolha o mês de referência e faça o upload do ficheiro PDF ou Imagem. O seu contador será notificado automaticamente.' },
    { q: 'O que significa o status "Pendente"?', a: 'Significa que a nossa equipa contábil ainda está a analisar o documento que enviou. Assim que for aprovado, mudará para "Concluído".' },
    { q: 'Como atualizar a Diretoria?', a: 'Aceda ao menu "Governança e Diretoria". Lá pode adicionar novos membros e inativar os antigos para manter o seu quadro social em dia.' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', backgroundColor: '#ffedd5', color: '#ea580c', borderRadius: '8px' }}><SupportIcon /></div>
          Ajuda Institucional
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
          Tire as suas dúvidas ou entre em contacto com o suporte técnico da plataforma.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Contacto de Suporte */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '50%' }}>
            <MailIcon />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>Precisa de ajuda com o sistema?</h3>
            <p style={{ color: '#6b7280', margin: '0 0 12px 0', fontSize: '14px' }}>A nossa equipa técnica está pronta para ajudar com qualquer erro ou dificuldade.</p>
            <a href="mailto:suporte@contacomigo.org.br" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
              <MailIcon /> Enviar E-mail para o Suporte
            </a>
          </div>
        </div>

        {/* Perguntas Frequentes */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FAQIcon /> Perguntas Frequentes (FAQ)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ paddingBottom: '16px', borderBottom: index !== faqs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#374151', margin: '0 0 8px 0' }}>{faq.q}</h4>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}