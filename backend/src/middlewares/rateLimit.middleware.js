// backend/src/middlewares/rateLimit.middleware.js
//
// Limitador simples em memória (sem dependências novas). Suficiente para uma única
// instância PM2; para múltiplas instâncias, trocar por um store compartilhado.

const buckets = new Map();

/**
 * @param {object} opts
 * @param {number} opts.windowMs  janela em ms
 * @param {number} opts.max       máximo de tentativas por chave na janela
 * @param {(req)=>string} opts.keyFn  chave (padrão: IP)
 * @param {boolean} opts.resetOnSuccess  zera o contador quando a resposta é bem-sucedida (login):
 *        só tentativas FALHAS contam, então usuários legítimos nunca são bloqueados por entrar várias vezes.
 */
export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 10, keyFn = (req) => req.ip, message, resetOnSuccess = false } = {}) => {
    return (req, res, next) => {
        const key = keyFn(req);
        const now = Date.now();
        const bucket = buckets.get(key);

        if (resetOnSuccess) {
            res.on('finish', () => {
                if (res.statusCode < 400) buckets.delete(key);
            });
        }

        if (!bucket || bucket.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        bucket.count += 1;
        if (bucket.count > max) {
            const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({
                message: message || 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
            });
        }
        next();
    };
};

// Limpeza periódica para não acumular chaves antigas.
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}, 10 * 60 * 1000).unref();
