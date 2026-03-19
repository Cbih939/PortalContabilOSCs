import pool from '../config/db.js';

// Função Pública: Todos os utilizadores (mesmo sem login) podem ver o status
export const getSystemStatus = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM system_settings');
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = r.setting_value);
    
    res.json({
      maintenance_mode: settings.maintenance_mode === 'true',
      maintenance_start_time: settings.maintenance_start_time
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar status do sistema' });
  }
};

// Função Privada: Só o Admin pode alterar
export const toggleMaintenance = async (req, res) => {
  try {
    const { active, minutesUntilLock } = req.body;

    if (active) {
       // Calcula a hora exata do "Kick" (Expulsão)
       const lockTime = new Date(Date.now() + minutesUntilLock * 60000).toISOString();
       await pool.execute('UPDATE system_settings SET setting_value = "true" WHERE setting_key = "maintenance_mode"');
       await pool.execute('UPDATE system_settings SET setting_value = ? WHERE setting_key = "maintenance_start_time"', [lockTime]);
    } else {
       // Desativa a manutenção
       await pool.execute('UPDATE system_settings SET setting_value = "false" WHERE setting_key = "maintenance_mode"');
       await pool.execute('UPDATE system_settings SET setting_value = NULL WHERE setting_key = "maintenance_start_time"');
    }
    
    res.json({ success: true, message: active ? 'Modo de Manutenção Ativado!' : 'Sistema Normalizado!' });
  } catch(err) {
    res.status(500).json({ message: 'Erro ao alterar manutenção' });
  }
};