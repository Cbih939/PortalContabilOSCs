import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Espera: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Salva os dados do usuário na requisição
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

// CRUCIAL: Exportar 'protect' como um alias para 'verifyToken'
// Isso corrige o erro: "does not provide an export named 'protect'"
export const protect = verifyToken;

// Middleware para verificar permissões de Admin ou Contador
export const isContadorOrAdmin = (req, res, next) => {
    if (req.user.role === 'Contador' || req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso restrito.' });
    }
};