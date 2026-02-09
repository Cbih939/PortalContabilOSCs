import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123jwt';

// 1. Verifica se o token é válido
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adiciona dados do usuário (id, role) à requisição
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

// 2. Alias para rotas que importam { protect }
export const protect = verifyToken;

// 3. Verifica o papel (Role) do usuário (VERSÃO CORRIGIDA)
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Acesso proibido. Role não identificado.' });
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        // Normalizamos tudo para minúsculas antes de comparar
        const userRole = req.user.role.toLowerCase();
        const hasPermission = roles.some(role => role.toLowerCase() === userRole);

        if (!hasPermission) {
            console.warn(`[Acesso Negado] Usuário ${req.user.id} com role '${req.user.role}' tentou acessar rota permitida para: ${roles}`);
            return res.status(403).json({ 
                message: 'Acesso proibido. Você não tem permissão para acessar este recurso.' 
            });
        }
        next();
    };
};

// 1. Bloqueia acesso se estiver em manutenção (exceto admins)
export const maintenanceGuard = async (req, res, next) => {
    const [settings] = await pool.execute('SELECT maintenance_mode FROM system_settings WHERE id = 1');
    if (settings[0].maintenance_mode && req.user?.role !== 'admin') {
        return res.status(503).json({ 
            maintenance: true, 
            message: "Plataforma em manutenção para atualizações. Voltamos em breve!" 
        });
    }
    next();
};

// 2. Bloqueia módulos se estiver em débito (CORRIGIDO)
export const debtGuard = (req, res, next) => {
    // Lista de caminhos que a OSC PODE acessar mesmo devendo
    const allowedPaths = [
        '/api/admin/financeiro', // Rota para buscar dados de pagamento
        '/api/messages',         // Mensagens para suporte
        '/api/auth/logout'       // Sair do sistema
    ];

    const isAllowed = allowedPaths.some(path => req.path.startsWith(path));

    if (req.user?.is_in_debt && !isAllowed && req.user?.role === 'osc') {
        return res.status(402).json({ 
            debt: true, 
            message: "Acesso Suspenso. Por favor, regularize seu pagamento no módulo Financeiro." 
        });
    }
    next();
};