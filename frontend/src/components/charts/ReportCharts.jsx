import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Legend as BarLegend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import Spinner from '../common/Spinner';

export default function ReportCharts({ role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/charts');
        setData(response.data);
      } catch (err) {
        setError('Erro ao carregar gráficos estatísticos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', padding: '40px'}}><Spinner text="A compilar dados gráficos..." /></div>;
  if (error) return <div style={{color: '#dc2626', textAlign: 'center', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca'}}>{error}</div>;
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      
      {role !== 'OSC' && data.totalOscs !== undefined && (
        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#374151' }}>Total de Instituições Analisadas: <strong style={{color: '#111827', fontSize: '20px'}}>{data.totalOscs}</strong></h3>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        {/* Gráfico de Status Geral */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#111827', textAlign: 'center', fontWeight: 'bold' }}>
            Situação Geral de Adimplência
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.statusGeral}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.statusGeral.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <PieTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <PieLegend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico Semestral */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#111827', textAlign: 'center', fontWeight: 'bold' }}>
            Panorama do Semestre Atual
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.semestral}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {data.semestral.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <PieTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <PieLegend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Barras Mensal */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '16px', color: '#111827', textAlign: 'center', fontWeight: 'bold' }}>
          Cumprimento Mensal (Últimos 6 Meses)
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data.mensal} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13, fontWeight: 500}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dx={-10} />
            <BarTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
            <BarLegend wrapperStyle={{paddingTop: '20px'}} iconType="circle" />
            <Bar dataKey="enviados" name="Documentos OK" stackId="a" fill="#10b981" radius={[0, 0, 6, 6]} />
            <Bar dataKey="faltantes" name="Pendências" stackId="a" fill="#f87171" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
