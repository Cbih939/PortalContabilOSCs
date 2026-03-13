import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seusecretoseguro123jwt';

// --- MIDDLEWARES ---
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido.' });
    }
};

export const protect = verifyToken;

// --- FUNÇÃO DE LOGIN (DECLARAÇÃO ÚNICA) ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Preencha todos os campos.' });

        // CORREÇÃO 1: Adicionado o office_id na busca do banco de dados
        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, status, is_in_debt, office_id FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) return res.status(401).json({ message: 'Credenciais inválidas.' });

        const user = rows[0];
        if (user.status !== 'Ativo') return res.status(403).json({ message: 'Conta inativa.' });

        let isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) return res.status(401).json({ message: 'Senha incorreta.' });

        // CORREÇÃO 2: Adicionado o office_id dentro do Crachá (Token JWT)
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                name: user.name, 
                is_in_debt: user.is_in_debt,
                office_id: user.office_id // <--- MÁGICA AQUI
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                is_in_debt: user.is_in_debt,
                office_id: user.office_id // <--- E AQUI
            }
        });
    } catch (error) {
        console.error('[Auth Error]:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// --- FUNÇÃO DE REGISTRO ---
// --- FUNÇÃO DE REGISTRO ---
export const registerOSC = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const data = req.body;
        const files = req.files || {}; // Prevenção de erro de ficheiros

        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [data.coordEmail]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.coordSenha, salt);
        
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role, status, is_in_debt) VALUES (?, ?, ?, "OSC", "Ativo", 1)',
            [data.coordNome, data.coordEmail, hashedPassword]
        );
        const userId = userResult.insertId;

        const logoPath = files['logotipo'] ? `uploads/public/${files['logotipo'][0].filename}` : null;
        const ataPath = files['ata'] ? `uploads/public/${files['ata'][0].filename}` : null;
        const estatutoPath = files['estatuto'] ? `uploads/public/${files['estatuto'][0].filename}` : null;

        // --- ATUALIZAÇÃO AQUI: Adicionamos as duas novas datas no SQL ---
        const sqlOSC = `
            INSERT INTO oscs (
                user_id, name, razao_social, cnpj, data_fundacao, email_contato, telefone, 
                cep, endereco, numero, bairro, cidade, estado, logo_path, ata_path, estatuto_path, assigned_contador_id,
                data_origem_estatuto, data_contrato_conta_comigo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`;

        await connection.execute(sqlOSC, [
            userId, 
            data.nomeFantasia, 
            data.razaoSocial, 
            data.cnpj, 
            data.dataFundacao || null,
            data.emailContato, 
            data.telefone, 
            data.cep, 
            data.endereco, 
            data.numero,
            data.bairro, 
            data.cidade, 
            data.estado, 
            logoPath, 
            ataPath, 
            estatutoPath,
            // --- ATUALIZAÇÃO AQUI: Os valores das datas vindos do frontend ---
            data.dataOrigemEstatuto || null,
            data.data_contrato_conta_comigo || null
        ]);

        await connection.commit();

        // Gerar token de login automático
        const token = jwt.sign(
            { id: userId, role: 'OSC', name: data.coordNome, is_in_debt: 1 },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, message: "Cadastro realizado com sucesso." });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Register OSC Error]:', error);
        res.status(500).json({ message: 'Erro ao processar o cadastro.' });
    } finally {
        if (connection) connection.release();
    }
};