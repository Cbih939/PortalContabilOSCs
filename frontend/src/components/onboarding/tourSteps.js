import { ROLES, normalizeRole } from '../../utils/constants.js';

// `target` = valor do atributo data-tour do elemento a destacar. Sem alvo visível, o passo é exibido centralizado.
const welcome = {
  key: 'welcome',
  title: 'Bem-vindo ao Conta Comigo',
  text: 'Vamos fazer um passeio rápido, de cerca de 1 minuto, para você saber onde está cada coisa.',
};
const done = {
  key: 'done',
  title: 'Pronto!',
  text: 'Você já conhece o essencial. Se quiser rever este passeio, use "Ver tutorial novamente" no seu perfil.',
};

export const HOME_PATHS = {
  [ROLES.OSC]: '/osc/inicio',
  [ROLES.CONTADOR]: '/contador/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};

export function getTourSteps(user, isOfficeAdmin) {
  const role = normalizeRole(user?.role);

  if (role === ROLES.OSC) {
    return [
      welcome,
      { key: 'upload', target: 'upload-cta', title: 'Envie seus documentos aqui', text: 'Toque neste botão sempre que precisar enviar um documento ao seu escritório contábil.' },
      { key: 'recent', target: 'recent-docs', title: 'Acompanhe o processamento', text: 'Aqui aparecem os últimos envios e o status de cada um: "Em análise" ou "Concluído".' },
      { key: 'sent', target: 'stat-sent', title: 'Veja quantos documentos você enviou', text: 'Este cartão mostra quantos documentos você enviou neste mês, em relação à referência mensal.' },
      { key: 'history', target: 'history-chart', title: 'Consulte seu histórico', text: 'O gráfico mostra o volume de envios mês a mês, inclusive os meses sem movimento.' },
      done,
    ];
  }

  if (role === ROLES.CONTADOR) {
    return [
      welcome,
      { key: 'sent', target: 'stat-sent', title: 'Acompanhe os envios da carteira', text: 'Veja quantos documentos as suas OSCs enviaram no mês e quantos aguardam a sua análise.' },
      { key: 'late', target: 'late-oscs', title: 'Identifique pendências', text: 'A lista mostra as OSCs com documentos aguardando validação ou com meses em atraso.' },
      { key: 'history', target: 'history-chart', title: 'Evolução mensal', text: 'Compare o fluxo de documentos ao longo dos meses e encontre os períodos de maior movimento.' },
      { key: 'reports', target: 'nav-reports-side', title: 'Relatórios', text: isOfficeAdmin ? 'Em "Mais" você encontra relatórios, a equipe do escritório e o financeiro.' : 'Em "Mais" você encontra os relatórios do sistema, modelos e certificadoras.' },
      done,
    ];
  }

  return [
    welcome,
    { key: 'sent', target: 'stat-sent', title: 'Visão global', text: 'Acompanhe o volume de documentos de todos os escritórios e OSCs da plataforma.' },
    { key: 'history', target: 'history-chart', title: 'Histórico de envios', text: 'Veja a evolução mensal e os meses de maior fluxo de documentos.' },
    { key: 'finance', target: 'nav-finance-side', title: 'Financeiro', text: 'Débitos, histórico de pagamentos e a configuração do Stripe agora ficam no Financeiro.' },
    { key: 'reports', target: 'nav-reports-side', title: 'Auditoria', text: 'Consulte o registro de ações realizadas no sistema.' },
    done,
  ];
}
