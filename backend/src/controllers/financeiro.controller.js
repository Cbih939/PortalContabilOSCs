// backend/src/controllers/financeiro.controller.js
//
// Módulo financeiro após a descontinuação do perfil FINANCEIRO.
//   ADMIN        -> visão global (todas as OSCs) + configuração do Stripe
//   ADM Contador -> somente as OSCs do próprio escritório (sem acesso ao Stripe)
//
// Toda consulta passa por `financeScope`, que aplica o filtro de escritório.

import pool from '../config/db.js';
import { logAction } from '../services/logger.service.js';
import { invalidateUserCache } from '../middlewares/auth.middleware.js';
import { isAdmin, officeIdOf } from '../utils/roles.js';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Filtro das OSCs (usuários de perfil OSC) visíveis ao ator.
 * Espera a query com `users u LEFT JOIN oscs o ON o.user_id = u.id`.
 */
const financeScope = (req) => {
  if (isAdmin(req.user)) {
    const officeFilter = req.query.officeId;
    return officeFilter
      ? { sql: "UPPER(u.role) = 'OSC' AND o.office_id = ?", params: [officeFilter] }
      : { sql: "UPPER(u.role) = 'OSC'", params: [] };
  }
  return { sql: "UPPER(u.role) = 'OSC' AND o.office_id = ?", params: [officeIdOf(req.user)] };
};

const isMissingTable = (error) => error?.code === 'ER_NO_SUCH_TABLE';

// --- 1. CONFIGURAÇÕES DO STRIPE (somente ADMIN) ---------------------------------------------
const mask = (value) => (value ? `••••${String(value).slice(-4)}` : '');

export const getStripeConfig = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stripe_configs WHERE id = 1');
    const s = rows[0] || {};
    // Segredos NUNCA voltam ao navegador: só um indicador e os 4 últimos caracteres.
    res.json({
      stripePublishableKey: s.stripePublishableKey || '',
      stripeSecretKeySet: !!s.stripeSecretKey,
      stripeSecretKeyMasked: mask(s.stripeSecretKey),
      stripeWebhookSecretSet: !!s.stripeWebhookSecret,
      stripeWebhookSecretMasked: mask(s.stripeWebhookSecret),
      monthlyPriceId: s.monthlyPriceId || '',
      packageValue: s.packageValue || '',
    });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.json({
        stripePublishableKey: '', stripeSecretKeySet: false, stripeSecretKeyMasked: '',
        stripeWebhookSecretSet: false, stripeWebhookSecretMasked: '', monthlyPriceId: '', packageValue: '',
      });
    }
    console.error('Erro ao buscar configurações Stripe:', error);
    res.status(500).json({ message: 'Erro interno ao buscar configurações' });
  }
};

export const updateStripeConfig = async (req, res) => {
  try {
    const { stripePublishableKey, stripeSecretKey, stripeWebhookSecret, monthlyPriceId, packageValue } = req.body;

    const [rows] = await pool.query('SELECT stripeSecretKey, stripeWebhookSecret FROM stripe_configs WHERE id = 1');
    const current = rows[0] || {};

    // Campo em branco (ou o valor mascarado) = manter o segredo atual.
    const keep = (incoming, existing) => (incoming && !String(incoming).startsWith('••') ? incoming : (existing || null));

    await pool.execute(
      `INSERT INTO stripe_configs (id, stripePublishableKey, stripeSecretKey, stripeWebhookSecret, monthlyPriceId, packageValue)
       VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         stripePublishableKey = VALUES(stripePublishableKey),
         stripeSecretKey = VALUES(stripeSecretKey),
         stripeWebhookSecret = VALUES(stripeWebhookSecret),
         monthlyPriceId = VALUES(monthlyPriceId),
         packageValue = VALUES(packageValue)`,
      [
        stripePublishableKey || null,
        keep(stripeSecretKey, current.stripeSecretKey),
        keep(stripeWebhookSecret, current.stripeWebhookSecret),
        monthlyPriceId || null,
        packageValue || 0,
      ]
    );

    await logAction(req.user.id, req.user.name, null, 'EDITOU', 'FINANCEIRO', 'Atualizou a configuração do Stripe.');
    res.json({ message: 'Configurações atualizadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar configurações Stripe:', error);
    res.status(500).json({ message: 'Erro ao salvar configurações' });
  }
};

// --- 2. ESTATÍSTICAS ---------------------------------------------------------------------
export const getFinanceiroStats = async (req, res) => {
  try {
    const scope = financeScope(req);

    const [counts] = await pool.execute(
      `SELECT COUNT(*) AS totalOSCs,
              SUM(CASE WHEN u.is_in_debt = 0 THEN 1 ELSE 0 END) AS emDia,
              SUM(CASE WHEN u.is_in_debt = 1 THEN 1 ELSE 0 END) AS inadimplentes
         FROM users u LEFT JOIN oscs o ON o.user_id = u.id
        WHERE ${scope.sql}`,
      scope.params
    );

    // Últimos 6 meses (meses sem pagamento aparecem com valor 0)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    let paymentRows = [];
    try {
      [paymentRows] = await pool.execute(
        `SELECT YEAR(p.payment_date) AS y, MONTH(p.payment_date) AS m, SUM(p.amount) AS valor
           FROM payments p
           JOIN users u ON p.user_id = u.id
           LEFT JOIN oscs o ON o.user_id = u.id
          WHERE p.status = 'succeeded' AND p.payment_date >= ? AND ${scope.sql}
          GROUP BY y, m`,
        [startDate, ...scope.params]
      );
    } catch (error) {
      if (!isMissingTable(error)) throw error;
    }

    const byKey = new Map(paymentRows.map(r => [`${r.y}-${r.m}`, Number(r.valor) || 0]));
    const pagamentosHistorico = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      pagamentosHistorico.push({
        mes: `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        valor: byKey.get(`${d.getFullYear()}-${d.getMonth() + 1}`) || 0,
      });
    }

    res.json({
      scope: isAdmin(req.user) ? 'global' : 'office',
      totalOSCs: Number(counts[0].totalOSCs) || 0,
      emDia: Number(counts[0].emDia) || 0,
      inadimplentes: Number(counts[0].inadimplentes) || 0,
      pagamentosHistorico,
    });
  } catch (error) {
    console.error('Erro SQL Stats:', error);
    res.status(500).json({ message: 'Erro ao processar dados financeiros' });
  }
};

// --- 3. GESTÃO DE OSCs (controle de débitos) ----------------------------------------------------
export const listOSCsFinanceiro = async (req, res) => {
  try {
    const { query } = req.query;
    const scope = financeScope(req);
    let sql = `SELECT u.id, u.name, COALESCE(o.cnpj, '') AS cnpj, u.is_in_debt, u.email, o.razao_social, o.office_id
                 FROM users u LEFT JOIN oscs o ON o.user_id = u.id
                WHERE ${scope.sql}`;
    const params = [...scope.params];

    if (query) {
      sql += ' AND (u.name LIKE ? OR o.cnpj LIKE ? OR o.razao_social LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    sql += ' ORDER BY u.name ASC';

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro na listagem:', error);
    res.status(500).json({ message: 'Erro ao listar OSCs' });
  }
};

export const updateDebtStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body.is_in_debt ? 1 : 0;

    // O alvo precisa estar no escopo do ator (ADM Contador só altera OSCs do próprio escritório).
    const scope = financeScope(req);
    const [targets] = await pool.execute(
      `SELECT u.id, u.name, o.id AS osc_id
         FROM users u LEFT JOIN oscs o ON o.user_id = u.id
        WHERE u.id = ? AND ${scope.sql}`,
      [id, ...scope.params]
    );
    if (targets.length === 0) return res.status(404).json({ message: 'OSC não encontrada no seu escopo.' });

    await pool.execute('UPDATE users SET is_in_debt = ? WHERE id = ?', [status, id]);
    invalidateUserCache(id);
    await logAction(req.user.id, req.user.name, targets[0].osc_id, 'EDITOU', 'FINANCEIRO',
      `${status ? 'Marcou como inadimplente' : 'Marcou como em dia'}: ${targets[0].name}.`);

    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar débito:', error);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};

// --- 4. HISTÓRICO DE PAGAMENTOS -----------------------------------------------------------------
export const getHistoricoPagamentos = async (req, res) => {
  try {
    const scope = financeScope(req);
    const [rows] = await pool.execute(
      `SELECT p.id, u.name AS osc_name, COALESCE(o.cnpj, '') AS cnpj, p.payment_date, p.amount,
              DATE_FORMAT(p.payment_date, '%m/%Y') AS competencia
         FROM payments p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN oscs o ON o.user_id = u.id
        WHERE p.status = 'succeeded' AND ${scope.sql}
        ORDER BY p.payment_date DESC
        LIMIT 500`,
      scope.params
    );
    res.json(rows);
  } catch (error) {
    if (isMissingTable(error)) return res.json([]);
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar histórico.' });
  }
};
