import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api.js';

export default function MaintenanceWatcher() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [warning, setWarning] = useState('');

    useEffect(() => {
        // Se não estiver logado, ou se for ADMIN, ele ignora a expulsão
        if (!user || user.role === 'ADMIN') return;

        const checkStatus = async () => {
            try {
                const { data } = await api.get('/system/status');
                
                if (data.maintenance_mode) {
                    const lockTime = new Date(data.maintenance_start_time).getTime();
                    const now = Date.now();
                    
                    if (now >= lockTime) {
                        // O tempo acabou! Expulsa o utilizador
                        logout();
                        navigate('/manutencao');
                    } else {
                        // Ainda há tempo, mostra a faixa vermelha
                        const minsLeft = Math.ceil((lockTime - now) / 60000);
                        setWarning(`⚠️ MODO DE MANUTENÇÃO ATIVADO: O sistema será reiniciado e você será desconectado em ${minsLeft} minuto(s). Salve o seu trabalho!`);
                    }
                } else {
                    setWarning('');
                }
            } catch (err) {
                console.error('Erro ao verificar status do sistema');
            }
        };

        checkStatus(); // Verifica mal entra na página
        const interval = setInterval(checkStatus, 30000); // Volta a verificar a cada 30 segundos
        
        return () => clearInterval(interval);
    }, [user, logout, navigate, location]);

    if (!warning) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#dc2626', color: 'white', textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 'bold', zIndex: 99999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {warning}
        </div>
    );
}