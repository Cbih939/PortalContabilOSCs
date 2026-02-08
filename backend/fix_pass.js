import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fix() {
    try {
        // Tenta usar a URL do .env ou as credenciais manuais
        const connection = await mysql.createConnection(process.env.DATABASE_URL || {
            host: 'localhost',
            user: 'root', // ajuste se necessário
            password: 'root', // ajuste se necessário
            database: 'portal_contabil' // ajuste se necessário
        });

const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('financeiro123', salt);

        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, 'financeiro@portal.com.br']
        );

        if (result.affectedRows > 0) {
            console.log("✅ Senha do financeiro atualizada com sucesso!");
        } else {
            console.log("⚠️ Usuário não encontrado no banco.");
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Erro:", error.message);
        process.exit(1);
    }
}

fix();