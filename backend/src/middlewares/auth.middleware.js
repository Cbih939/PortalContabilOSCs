import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

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

// 3. Verifica o papel (Role) do usuário
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // allowedRoles pode ser uma string ou array. Convertemos para array.
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Acesso proibido. Você não tem permissão para acessar este recurso.' 
            });
        }
        next();
    };
};