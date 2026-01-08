import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

// 1. Função principal de verificação
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, name }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

// 2. Alias 'protect' (para compatibilidade com arquivos que importam { protect })
export const protect = verifyToken;

// 3. Middleware de verificação de papel (Role)
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso restrito. Permissão insuficiente.' });
    }
    next();
  };
};

// 4. Helper específico para Contador ou Admin
export const isContadorOrAdmin = (req, res, next) => {
    if (req.user.role === 'Contador' || req.user.role === 'Adm') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso restrito a Contadores.' });
    }
};