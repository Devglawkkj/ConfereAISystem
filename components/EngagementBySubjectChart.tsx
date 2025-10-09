
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AttendanceLog } from '../types';

interface EngagementBySubjectChartProps {
  data: AttendanceLog[];
}

const EngagementBySubjectChart: React.FC<EngagementBySubjectChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const engagementBySubject: { [key: string]: { total: number; count: number } } = {};

    data.forEach(log => {
      // Exclude generic subjects from the chart for clearer insights
      if (log.disciplina === 'Atividade Geral' || log.disciplina === 'Intervalo') {
          return;
      }
      const subject = log.disciplina;
      if (!engagementBySubject[subject]) {
        engagementBySubject[subject] = { total: 0, count: 0 };
      }
      engagementBySubject[subject].total += log.indiceEngajamento;
      engagementBySubject[subject].count += 1;
    });

    return Object.keys(engagementBySubject).map(subject => ({
      name: subject,
      Engajamento: Math.round(engagementBySubject[subject].total / engagementBySubject[subject].count),
    }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado de disciplina para exibir.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        <Bar dataKey="Engajamento" fill="#818CF8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EngagementBySubjectChart;