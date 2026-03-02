import pool from '../../config/db.js';
import bcrypt from 'bcryptjs'; // Certifique-se de que tem o bcryptjs instalado

export const updatePassword = async (req, res) => {
  // Assumindo que o seu middleware de autenticação coloca os dados do usuário em req.user
  const userId = req.user.id; 
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Busca a senha atual criptografada no banco
    const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = users[0];

    // 2. Compara a senha digitada com a que está no banco
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'A senha atual está incorreta.' });
    }

    // 3. Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 4. Atualiza no banco de dados
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);

    return res.json({ success: true, message: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error('[Profile Error]:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar a senha.' });
  }
};