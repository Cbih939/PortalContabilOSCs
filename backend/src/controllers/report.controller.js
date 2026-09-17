import pool from '../config/db.js';

export const getChartData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let oscsQuery = 'SELECT id, razao_social, created_at, data_origem_estatuto, data_fundacao FROM oscs';
        const queryParams = [];

        if (userRole?.toUpperCase() === 'CONTADOR') {
            oscsQuery += ' WHERE assigned_contador_id = ?';
            queryParams.push(userId);
        } else if (userRole?.toUpperCase() === 'OSC') {
            oscsQuery += ' WHERE user_id = ?';
            queryParams.push(userId);
        }

        const [oscs] = await pool.execute(oscsQuery, queryParams);

        if (oscs.length === 0) {
            return res.json({
                statusGeral: [],
                mensal: [],
                semestral: []
            });
        }

        const oscIds = oscs.map(o => o.id);
        const placeholders = oscIds.map(() => '?').join(',');

        const [documents] = await pool.execute(
            `SELECT osc_id, ref_month, ref_year, doc_type, status 
             FROM documents 
             WHERE osc_id IN (${placeholders})`,
            oscIds
        );

        // Current date info
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1 to 12
        const currentDay = today.getDate();
        
        // Define max month to check (previous month, or current if past day 10)
        let checkUpToMonth = currentMonth;
        if (currentDay <= 10) {
            checkUpToMonth = currentMonth - 1;
        }

        // 1. Status Geral (OK vs Pendente)
        let countOk = 0;
        let countPendente = 0;
        
        // 2. Estatísticas Mensais (últimos 6 meses)
        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            let m = currentMonth - i;
            let y = currentYear;
            if (m <= 0) {
                m += 12;
                y -= 1;
            }
            // Nome do mes abreviado
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            monthsData.push({ month: m, year: y, name: `${monthNames[m-1]}/${y.toString().slice(-2)}`, enviados: 0, faltantes: 0 });
        }

        let pendenciasNoSemestre = 0;
        let okNoSemestre = 0;

        oscs.forEach(osc => {
            const oscDocs = documents.filter(d => d.osc_id === osc.id);
            let hasPendency = false;

            let originDate = osc.data_origem_estatuto || osc.data_fundacao || osc.created_at;
            let originYear = 2000, originMonth = 1;
            if (originDate) {
                const d = new Date(originDate);
                originYear = d.getFullYear();
                originMonth = d.getMonth() + 1;
            }

            // Check current year up to checkUpToMonth
            for (let m = 1; m <= checkUpToMonth; m++) {
                if (currentYear < originYear || (currentYear === originYear && m < originMonth)) continue;
                
                const isConcluido = oscDocs.some(d => Number(d.ref_month) === m && Number(d.ref_year) === currentYear && (d.status === 'CONCLUIDO' || d.doc_type === 'CONCLUSO TEC'));
                if (!isConcluido) {
                    hasPendency = true;
                }
            }

            if (hasPendency) countPendente++;
            else countOk++;

            // Monthly data
            monthsData.forEach(md => {
                if (md.year < originYear || (md.year === originYear && md.month < originMonth)) return; 
                
                const isConcluido = oscDocs.some(d => Number(d.ref_month) === md.month && Number(d.ref_year) === md.year && (d.status === 'CONCLUIDO' || d.doc_type === 'CONCLUSO TEC'));
                if (isConcluido) {
                    md.enviados++;
                } else {
                    md.faltantes++;
                }
            });
            
            // Semestral
            const currentSemester = currentMonth <= 6 ? 1 : 2;
            let semStart = currentSemester === 1 ? 1 : 7;
            let semEnd = currentSemester === 1 ? 6 : 12;
            let semPendency = false;
            
            for (let m = semStart; m <= Math.min(semEnd, checkUpToMonth); m++) {
                if (currentYear < originYear || (currentYear === originYear && m < originMonth)) continue;
                const isConcluido = oscDocs.some(d => Number(d.ref_month) === m && Number(d.ref_year) === currentYear && (d.status === 'CONCLUIDO' || d.doc_type === 'CONCLUSO TEC'));
                if (!isConcluido) {
                    semPendency = true;
                }
            }
            if (semPendency) pendenciasNoSemestre++;
            else okNoSemestre++;
        });

        // if role is OSC, we only have 1 osc, so instead of count of oscs, we want to just say OK vs Pendente
        // but charts expect numbers. If it's just 1 OSC, the chart will show 1 OK or 1 Pendente.
        
        const statusGeral = [
            { name: 'Em Dia (OK)', value: countOk, fill: '#10b981' },
            { name: 'Com Pendências', value: countPendente, fill: '#ef4444' }
        ];

        const semestral = [
            { name: 'Semestre OK', value: okNoSemestre, fill: '#3b82f6' },
            { name: 'Semestre Pendente', value: pendenciasNoSemestre, fill: '#f59e0b' }
        ];

        res.json({
            statusGeral,
            mensal: monthsData,
            semestral,
            totalOscs: oscs.length
        });
    } catch (error) {
        console.error('[Chart Data Error]', error);
        res.status(500).json({ message: 'Erro ao gerar dados dos gráficos. Detalhe: ' + error.message });
    }
};
