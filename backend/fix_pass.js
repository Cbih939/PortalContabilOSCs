// fix_pass.js
const bcrypt = require('bcryptjs'); // ou 'bcrypt' dependendo do seu package.json
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL || {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'portal_contabil'
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('financeiro123', salt);

    await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hash, 'financeiro@portal.com.br']
    );

    console.log("Senha do financeiro atualizada com sucesso!");
    process.exit();
}

fix();