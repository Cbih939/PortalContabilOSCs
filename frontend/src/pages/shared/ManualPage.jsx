import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ManualPage() {
  
  // Ativa o scroll suave na página
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  const s = {
    container: { minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, Arial, sans-serif' },
    nav: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', width: '100%', top: 0, zIndex: 50, boxSizing: 'border-box' },
    layout: { display: 'flex', maxWidth: '1200px', margin: '80px auto 40px', padding: '0 20px', gap: '30px', alignItems: 'flex-start' },
    
    // Estilos do Índice Lateral (Sidebar)
    sidebar: { width: '300px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', position: 'sticky', top: '100px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', flexShrink: 0 },
    sidebarTitle: { margin: '0 0 15px 0', fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' },
    indexLink: { display: 'block', color: '#4b5563', textDecoration: 'none', fontSize: '13px', padding: '6px 8px', borderRadius: '6px', marginBottom: '4px', transition: 'all 0.2s' },
    
    // Estilos do Conteúdo
    content: { flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' },
    mainTitle: { margin: '0 0 10px 0', color: '#111827', fontSize: '32px', fontWeight: '900', lineHeight: '1.2' },
    subtitle: { margin: '0 0 30px 0', color: '#6b7280', fontSize: '18px', lineHeight: '1.5' },
    h2: { color: '#111827', fontSize: '20px', fontWeight: 'bold', marginTop: '48px', marginBottom: '16px', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', scrollMarginTop: '100px' },
    h3: { color: '#374151', fontSize: '16px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' },
    p: { color: '#4b5563', fontSize: '15px', lineHeight: '1.7', marginBottom: '16px' },
    ul: { margin: '0 0 24px 24px', color: '#4b5563', fontSize: '15px', lineHeight: '1.7' },
    li: { marginBottom: '6px' },
    link: { color: '#ea580c', textDecoration: 'none', fontWeight: '600' },
    highlightBox: { backgroundColor: '#fff7ed', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ea580c', margin: '24px 0' },
    highlightText: { color: '#9a3412', fontWeight: '600', margin: 0, fontSize: '15px', lineHeight: '1.6' }
  };

  const topics = [
    { id: 't1', title: '1. Apresentação' },
    { id: 't2', title: '2. Para quem este manual serve' },
    { id: 't3', title: '3. Conceitos essenciais' },
    { id: 't4', title: '4. O que o Conta Comigo resolve' },
    { id: 't5', title: '5. Documentação no aplicativo' },
    { id: 't6', title: '6. Criar associação' },
    { id: 't7', title: '7. Criar cooperativa' },
    { id: 't8', title: '8. CNPJ e REDESIM' },
    { id: 't9', title: '9. Inscrição municipal' },
    { id: 't10', title: '10. Inscrição estadual' },
    { id: 't11', title: '11. Pesquisa de inscrição' },
    { id: 't12', title: '12. Links Sefaz por estado' },
    { id: 't13', title: '13. Documentos exigidos' },
    { id: 't14', title: '14. NFS-e (Serviços)' },
    { id: 't15', title: '15. NF-e (Mercadorias)' },
    { id: 't16', title: '16. SPED, ECD e ECF' },
    { id: 't17', title: '17. Plano de contas' },
    { id: 't18', title: '18. Centros de custo e projetos' },
    { id: 't19', title: '19. Rotina financeira mensal' },
    { id: 't20', title: '20. Prestação de contas' },
    { id: 't21', title: '21. Governança institucional' },
    { id: 't22', title: '22. Cooperativas' },
    { id: 't23', title: '23. Erros mais comuns' },
    { id: 't24', title: '24. Apresentação ao cliente' },
    { id: 't25', title: '25. Menu no app' },
    { id: 't26', title: '26. Checklist de implantação' },
    { id: 't27', title: '27. Encerramento' }
  ];

  return (
    <div style={s.container}>
      {/* Navbar Fixa no Topo */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo_portal.png" alt="Conta Comigo" style={{ height: '40px' }} />
          <h1 style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: 'bold' }}>Portal de Guias</h1>
        </div>
        <Link to="/login" style={{ color: '#ea580c', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>&larr; Voltar ao Sistema</Link>
      </nav>

      {/* Layout com Sidebar e Conteúdo */}
      <div style={s.layout}>
        
        {/* ÍNDICE LATERAL FLUTUANTE */}
        <aside style={s.sidebar}>
          <h3 style={s.sidebarTitle}>Índice do Manual</h3>
          <nav>
            {topics.map(topic => (
              <a 
                key={topic.id} 
                href={`#${topic.id}`} 
                style={s.indexLink}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#ea580c'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#4b5563'; }}
              >
                {topic.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* CONTEÚDO PRINCIPAL DO MANUAL */}
        <main style={s.content}>
          <h1 style={s.mainTitle}>CONTA COMIGO</h1>
          <p style={s.subtitle}>Manual de Gestão, Regularidade e Contabilidade para Associações sem Fins Lucrativos, OSCs, OSCIPs e Cooperativas</p>

          <h2 id="t1" style={s.h2}>1. Apresentação</h2>
          <p style={s.p}>O Conta Comigo é uma plataforma de gestão e contabilidade online voltada para organizações que, na prática, quase nunca encontram solução realmente adequada no mercado: associações sem fins lucrativos, organizações da sociedade civil, OSCIPs e cooperativas.</p>
          <p style={s.p}>Este manual foi estruturado para servir como:</p>
          <ul style={s.ul}><li>guia de onboarding de clientes do aplicativo</li></ul>
          <p style={s.p}>A proposta é simples: ajudar a organização a sair do improviso e operar com mais segurança, previsibilidade, transparência e capacidade de crescimento.</p>
          <p style={s.p}>Além da gestão contábil e financeira, o Conta Comigo é um ambiente em que você encontra também modelos prontos da documentação necessária para sua formalização e rotina institucional, como estatutos, atas, listas de presença, relatórios e documentos de prestação de contas.</p>

          <h2 id="t2" style={s.h2}>2. Para quem este manual serve</h2>
          <p style={s.p}>Este manual foi pensado especialmente para:</p>
          <ul style={s.ul}>
            <li>associações sem fins lucrativos</li>
            <li>OSCs, nos termos da Lei nº 13.019/2014</li>
            <li>OSCIPs, nos termos da Lei nº 9.790/1999</li>
            <li>cooperativas, regidas principalmente pela Lei nº 5.764/1971</li>
            <li>grupos produtivos em fase de formalização</li>
          </ul>
          <p style={s.p}>A Lei nº 13.019/2014 define o regime jurídico das parcerias com OSCs, e a Lei nº 9.790/1999 disciplina a qualificação como OSCIP.</p>

          <h2 id="t3" style={s.h2}>3. Conceitos essenciais</h2>
          <h3 style={s.h3}>3.1 Associação sem fins lucrativos</h3>
          <p style={s.p}>É a forma jurídica mais comum no terceiro setor. Em regra, é formada por pessoas reunidas para fins não econômicos, com disciplina geral no Código Civil. Ela pode ter receitas, cobrar contribuições, receber doações, executar projetos e até vender produtos ou prestar serviços de forma acessória, desde que não distribua resultados a dirigentes ou associados.</p>
          
          <h3 style={s.h3}>3.2 OSC</h3>
          <p style={s.p}>“OSC” é um conceito legal do Marco Regulatório das Organizações da Sociedade Civil. Em geral, envolve associações e fundações privadas sem fins lucrativos que possam celebrar parcerias com a administração pública na forma da Lei nº 13.019/2014.</p>
          
          <h3 style={s.h3}>3.3 OSCIP</h3>
          <p style={s.p}>OSCIP é uma qualificação concedida nos termos da Lei nº 9.790/1999. Nem toda associação é OSCIP, e nem toda OSC é OSCIP. A qualificação exige requisitos específicos e tem implicações próprias de governança e documentação.</p>
          
          <h3 style={s.h3}>3.4 Cooperativa</h3>
          <p style={s.p}>É sociedade de pessoas voltada ao exercício de atividade econômica de proveito comum, com regras próprias. Cooperativas costumam ter mais incidência de obrigações fiscais relacionadas à circulação de mercadorias e, por isso, mais frequentemente precisam de inscrição estadual. A base legal central continua sendo a Lei nº 5.764/1971.</p>

          <h2 id="t4" style={s.h2}>4. O que o Conta Comigo resolve</h2>
          <p style={s.p}>O Conta Comigo deve ser posicionado como uma contabilidade digital especializada no terceiro setor e no cooperativismo, não como uma plataforma genérica.</p>
          <p style={s.p}>Na prática, ele pode reunir em um só ambiente:</p>
          <ul style={s.ul}>
            <li>cadastro e organização institucional</li>
            <li>controle financeiro e conciliação bancária</li>
            <li>escrituração contábil e organização fiscal</li>
            <li>controle por projeto e centro de custo</li>
            <li>biblioteca de documentos e modelos</li>
            <li>apoio para emissão e guarda de notas fiscais</li>
            <li>preparação de dados para obrigações acessórias e rotinas de escritório</li>
          </ul>

          <h2 id="t5" style={s.h2}>5. Documentação: o que o usuário encontra no aplicativo</h2>
          <div style={s.highlightBox}>
            <p style={s.highlightText}>Toda a documentação necessária para a formalização e rotina institucional da organização está disponível em modelos prontos dentro do Conta Comigo.</p>
          </div>
          <p style={s.p}>Isso inclui:</p>
          <ul style={s.ul}>
            <li>estatuto social de associação / cooperativa</li>
            <li>ata de fundação / constituição</li>
            <li>ata de eleição de diretoria</li>
            <li>lista de presença e regimento interno</li>
            <li>relatórios de atividades e financeiros</li>
            <li>modelos básicos de prestação de contas</li>
            <li>documentos de organização de assembleias e reuniões</li>
          </ul>

          <h2 id="t6" style={s.h2}>6. Como criar uma associação sem fins lucrativos</h2>
          <h3 style={s.h3}>6.1 Grupo fundador</h3>
          <p style={s.p}>Reunião das pessoas interessadas em criar a entidade.</p>
          <h3 style={s.h3}>6.2 Elaboração do estatuto</h3>
          <p style={s.p}>O estatuto precisa definir: denominação, sede, finalidade, regras de admissão/desligamento, administração, eleição, patrimônio e dissolução.</p>
          <h3 style={s.h3}>6.3 Assembleia de fundação</h3>
          <p style={s.p}>Aprova o estatuto, constitui a associação e elege a primeira diretoria.</p>
          <h3 style={s.h3}>6.4 Registro em cartório</h3>
          <p style={s.p}>Normalmente no Cartório de Registro Civil de Pessoas Jurídicas.</p>
          <h3 style={s.h3}>6.5 CNPJ</h3>
          <p style={s.p}>Depois ou junto com o registro, solicita-se inscrição no CNPJ.</p>
          <h3 style={s.h3}>6.6 Cadastros complementares</h3>
          <p style={s.p}>Dependendo da atividade: inscrição municipal, estadual, alvarás e licenças específicas.</p>

          <h2 id="t7" style={s.h2}>7. Como criar uma cooperativa</h2>
          <ul style={s.ul}>
            <li><strong>7.1 Grupo de cooperados:</strong> Pessoas com interesse econômico comum.</li>
            <li><strong>7.2 Estatuto social:</strong> Define objetivos, admissão, quotas, administração e assembleias.</li>
            <li><strong>7.3 Assembleia de constituição:</strong> Aprovação do estatuto e eleição.</li>
            <li><strong>7.4 Registro na Junta Comercial:</strong> Em regra, cooperativas registram-se aqui.</li>
            <li><strong>7.5 CNPJ:</strong> Solicitação pós-registro.</li>
            <li><strong>7.6 Cadastros fiscais:</strong> Frequente necessidade de inscrição estadual e emissão de NF-e.</li>
          </ul>

          <h2 id="t8" style={s.h2}>8. CNPJ e REDESIM</h2>
          <p style={s.p}>A REDESIM foi criada pela Lei nº 11.598/2007 para simplificar e integrar o processo de registro e legalização de pessoas jurídicas. Na prática, muitos fluxos de abertura e alteração cadastral já dialogam com a REDESIM, articulando Receita Federal, juntas, cartórios, estados e municípios.</p>

          <h2 id="t9" style={s.h2}>9. Inscrição municipal</h2>
          <p style={s.p}>Costuma ser necessária quando a organização presta serviços sujeitos ao ISS, como cursos, consultorias, oficinas, eventos. O processo depende da prefeitura do domicílio da entidade.</p>

          <h2 id="t10" style={s.h2}>10. Inscrição estadual: quando é obrigatória</h2>
          <p style={s.p}>Normalmente é necessária quando a organização realiza circulação de mercadorias (ex: venda de artesanato, alimentos, produtos de oficinas, loja social, cooperativa de reciclagem/produção).</p>
          <div style={s.highlightBox}>
            <ul style={{...s.ul, margin: 0, color: '#9a3412'}}>
              <li>Se a organização só presta serviços: foque na inscrição municipal.</li>
              <li>Se a organização vende mercadorias: avalie a inscrição estadual.</li>
              <li>Se faz ambos: pode precisar das duas.</li>
            </ul>
          </div>

          <h2 id="t11" style={s.h2}>11. Como o usuário deve pesquisar a inscrição estadual</h2>
          <p style={s.p}>Em cada estado, o usuário deve procurar no portal fazendário expressões como: inscrição estadual, cadastro de contribuintes, cadastro ICMS, REDESIM, abertura de empresa ou alteração cadastral.</p>

          <h2 id="t12" style={s.h2}>12. Links oficiais das Secretarias da Fazenda por estado</h2>
          
          <h3 style={s.h3}>Região Norte</h3>
          <ul style={s.ul}>
            <li>Acre – <a href="http://www.sefaz.ac.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/AC</a></li>
            <li>Amapá – <a href="http://www.sefaz.ap.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/AP</a></li>
            <li>Amazonas – <a href="http://www.sefaz.am.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/AM</a></li>
            <li>Pará – <a href="http://www.sefa.pa.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFA/PA</a></li>
            <li>Rondônia – <a href="http://www.sefin.ro.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFIN/RO</a></li>
            <li>Roraima – <a href="https://www.sefaz.rr.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/RR</a></li>
            <li>Tocantins – <a href="http://www.sefaz.to.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/TO</a></li>
          </ul>

          <h3 style={s.h3}>Região Nordeste</h3>
          <ul style={s.ul}>
            <li>Alagoas – <a href="http://www.sefaz.al.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/AL</a></li>
            <li>Bahia – <a href="http://www.sefaz.ba.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/BA</a></li>
            <li>Ceará – <a href="https://www.sefaz.ce.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/CE</a></li>
            <li>Maranhão – <a href="https://portal.sefaz.ma.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/MA</a></li>
            <li>Paraíba – <a href="https://www.sefaz.pb.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/PB</a></li>
            <li>Pernambuco – <a href="https://www.sefaz.pe.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/PE</a></li>
            <li>Piauí – <a href="https://www.sefaz.pi.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/PI</a></li>
            <li>Rio Grande do Norte – <a href="http://www.set.rn.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SET/RN</a></li>
            <li>Sergipe – <a href="http://www.sefaz.se.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/SE</a></li>
          </ul>

          <h3 style={s.h3}>Região Centro-Oeste</h3>
          <ul style={s.ul}>
            <li>Distrito Federal – <a href="https://www.receita.fazenda.df.gov.br/" target="_blank" rel="noreferrer" style={s.link}>Secretaria de Economia/DF</a></li>
            <li>Goiás – <a href="https://www.economia.go.gov.br/" target="_blank" rel="noreferrer" style={s.link}>Secretaria da Economia/GO</a></li>
            <li>Mato Grosso – <a href="http://www.sefaz.mt.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/MT</a></li>
            <li>Mato Grosso do Sul – <a href="http://www.sefaz.ms.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/MS</a></li>
          </ul>

          <h3 style={s.h3}>Região Sudeste</h3>
          <ul style={s.ul}>
            <li>Espírito Santo – <a href="https://sefaz.es.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/ES</a></li>
            <li>Minas Gerais – <a href="http://www.fazenda.mg.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEF/MG</a></li>
            <li>Rio de Janeiro – <a href="http://www.fazenda.rj.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/RJ</a></li>
            <li>São Paulo – <a href="https://portal.fazenda.sp.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/SP</a></li>
          </ul>

          <h3 style={s.h3}>Região Sul</h3>
          <ul style={s.ul}>
            <li>Paraná – <a href="http://www.fazenda.pr.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFA/PR</a></li>
            <li>Santa Catarina – <a href="http://www.sef.sc.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEF/SC</a></li>
            <li>Rio Grande do Sul – <a href="https://receita.fazenda.rs.gov.br/" target="_blank" rel="noreferrer" style={s.link}>SEFAZ/RS</a></li>
          </ul>

          <h2 id="t13" style={s.h2}>13. Documentos normalmente exigidos para inscrição estadual</h2>
          <ul style={s.ul}>
            <li>CNPJ</li>
            <li>Ato constitutivo registrado</li>
            <li>Ata de eleição, quando aplicável</li>
            <li>Documento dos representantes</li>
            <li>Comprovante de endereço da sede</li>
            <li>Contrato de locação ou documento do imóvel, em alguns casos</li>
            <li>CNAE compatível com a atividade</li>
            <li>Licenças específicas, quando a atividade exigir</li>
          </ul>

          <h2 id="t14" style={s.h2}>14. NFS-e: nota fiscal de serviços</h2>
          <p style={s.p}>Para organizações que prestam serviços, o documento fiscal mais importante tende a ser a NFS-e. O governo federal mantém a documentação técnica do padrão nacional atualizada em produção.</p>
          <p style={s.p}>No Conta Comigo, a plataforma permite: guardar XML ou equivalente, registrar dados (tomador, valor, ISS), vincular a nota ao centro de custo/projeto e anexar comprovantes de recebimento.</p>

          <h2 id="t15" style={s.h2}>15. NF-e: nota fiscal de mercadorias</h2>
          <p style={s.p}>Para operações com mercadorias, a referência nacional continua sendo o Portal Nacional da NF-e. No app, a organização consegue vincular cada NF-e a estoques, projetos, centros de custo e clientes.</p>

          <h2 id="t16" style={s.h2}>16. SPED, ECD e ECF</h2>
          <p style={s.p}>O aplicativo organiza lançamentos contábeis corretamente, mantém o plano de contas coerente, guarda evidências e permite exportações ou integrações eficientes com o escritório contábil.</p>

          <h2 id="t17" style={s.h2}>17. Plano de contas recomendado para o terceiro setor</h2>
          <p style={s.p}>O plano deve separar com clareza:</p>
          <ul style={s.ul}>
            <li><strong>Ativo:</strong> bancos, aplicações, clientes, estoques.</li>
            <li><strong>Passivo:</strong> fornecedores, trabalhistas, tributos.</li>
            <li><strong>Patrimônio:</strong> patrimônio social, superávit/déficit.</li>
            <li><strong>Receitas:</strong> doações, convênios, prestação de serviços, vendas.</li>
            <li><strong>Despesas:</strong> administrativas, projetos, pessoal, captação.</li>
          </ul>
          <div style={s.highlightBox}>
            <p style={s.highlightText}>Regra de Ouro: Nunca misturar recurso livre com recurso vinculado, projeto A com projeto B, ou dinheiro institucional com dinheiro pessoal.</p>
          </div>

          <h2 id="t18" style={s.h2}>18. Centros de custo e projetos</h2>
          <p style={s.p}>O Conta Comigo trabalha com três chaves simultâneas: a natureza contábil da conta, o Centro de Custo (ex: administrativo, projeto social) e o Projeto/Fonte de Recurso (ex: Termo de fomento X, Doação livre). Isto permite uma prestação de contas séria.</p>

          <h2 id="t19" style={s.h2}>19. Rotina financeira mensal</h2>
          <p style={s.p}>Todo mês, a organização precisa no mínimo: lançar receitas e despesas, conciliar banco, conferir documentos, classificar por conta/projeto e fechar relatórios. O aplicativo ajuda com rotinas guiadas e avisos de pendências.</p>

          <h2 id="t20" style={s.h2}>20. Prestação de contas</h2>
          <p style={s.p}>Uma boa prestação une relatórios de atividades, financeiros, notas fiscais, extratos e comprovantes. O Conta Comigo oferece modelos, pastas digitais por projeto e checklists de entrega final.</p>

          <h2 id="t21" style={s.h2}>21. Governança institucional</h2>
          <p style={s.p}>Para associações, OSCs e OSCIPs, a governança não é detalhe. É parte da regularidade. O app permite o cadastro de dirigentes, o controle de vigência de mandatos e funciona como biblioteca de atas e estatutos.</p>

          <h2 id="t22" style={s.h2}>22. Particularidades das cooperativas</h2>
          <p style={s.p}>As cooperativas reúnem atividade econômica e regras societárias próprias. O app prevê módulos para cadastro de cooperados, produção/movimentação econômica, rateios e documentação assemblear.</p>

          <h2 id="t23" style={s.h2}>23. Erros mais comuns</h2>
          <ul style={s.ul}>
            <li>Abrir CNPJ sem organizar governança.</li>
            <li>Usar CNAE incompatível.</li>
            <li>Vender mercadorias sem avaliar inscrição estadual.</li>
            <li>Misturar recursos pessoais e institucionais.</li>
            <li>Não separar despesas por projeto ou não registrar assembleias.</li>
          </ul>

          <h2 id="t24" style={s.h2}>24. Como o Conta Comigo se apresenta ao cliente</h2>
          <p style={s.p}>Entregamos quatro camadas fundamentais:</p>
          <ul style={s.ul}>
            <li><strong>Formalização:</strong> Ajuda a abrir e organizar a entidade.</li>
            <li><strong>Regularidade:</strong> Mantém cadastros, documentação e governança.</li>
            <li><strong>Contabilidade:</strong> Organiza lançamentos, relatórios e integração.</li>
            <li><strong>Prestação de contas:</strong> Facilita prova documental e transparência.</li>
          </ul>

          <h2 id="t25" style={s.h2}>25. Estrutura recomendada de menu no app</h2>
          <p style={s.p}>Minha organização, Documentos e modelos, Abertura e regularização, Inscrição municipal, Inscrição estadual, Financeiro, Notas fiscais, Projetos, Contabilidade, Prestação de contas e Governança.</p>

          <h2 id="t26" style={s.h2}>26. Checklist de implantação no Conta Comigo</h2>
          <p style={s.p}>Ao entrar no app, a organização é guiada a preencher os seus dados de Identificação (CNPJ, atividade), dados Fiscais (inscrições e emissão de notas), Institucionais (diretoria, atas) e Financeiros (bancos, projetos).</p>

          <h2 id="t27" style={s.h2}>27. Encerramento</h2>
          <p style={s.p}>Este manual consolida a base necessária para que o Conta Comigo se torne uma plataforma realmente especializada em associações sem fins lucrativos, OSCs, OSCIPs e cooperativas.</p>
          <p style={s.p}>O maior diferencial estratégico do Conta Comigo não é apenas “fazer contabilidade online”.</p>
          <div style={{ ...s.highlightBox, backgroundColor: '#f0fdf4', borderLeftColor: '#16a34a' }}>
            <p style={{ ...s.highlightText, color: '#166534', fontSize: '18px' }}>É traduzir a complexidade do terceiro setor e do cooperativismo em rotina simples, segura e documentada.</p>
          </div>
        </main>
      </div>
    </div>
  );
}