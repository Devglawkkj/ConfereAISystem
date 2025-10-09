
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AttendanceLog, Student } from '../types';

interface EngagementChartProps {
  data: AttendanceLog[];
  students: Student[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data, students }) => {
  const chartData = useMemo(() => {
    // Create a lookup map for student ID to turma
    const studentTurmaMap = new Map<string, string>();
    students.forEach(student => {
        studentTurmaMap.set(student.id, student.turma);
    });

    const engagementByTurma: { [key: string]: { total: number; count: number } } = {};

    data.forEach(log => {
      const turma = studentTurmaMap.get(log.alunoId) || 'Turma Desconhecida';
      if (!engagementByTurma[turma]) {
        engagementByTurma[turma] = { total: 0, count: 0 };
      }
      engagementByTurma[turma].total += log.indiceEngajamento;
      engagementByTurma[turma].count += 1;
    });

    return Object.keys(engagementByTurma).map(turma => ({
      name: turma,
      Engajamento: Math.round(engagementByTurma[turma].total / engagementByTurma[turma].count),
    }));
  }, [data, students]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado de engajamento para exibir.</div>;
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
        <Bar dataKey="Engajamento" fill="#6366F1" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EngagementChart;
