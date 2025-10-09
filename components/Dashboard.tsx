

import React, { useState, useMemo } from 'react';
import { useFirestoreMock } from '../hooks/useFirestoreMock';
import { Student } from '../types';
import { generateDashboardInsights } from '../services/geminiService';
import EngagementChart from './EngagementChart';
import EngagementBySubjectChart from './EngagementBySubjectChart';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../constants';
import { BrainIcon, ChartBarIcon, ClockIcon, UsersIcon } from './icons/Icons';
import StudentHistoryModal from './StudentHistoryModal';

const Dashboard: React.FC = () => {
  const { students, attendanceLogs, addTherapistNote } = useFirestoreMock();
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<string>('Todas');

  const turmas = useMemo(() => {
    const uniqueTurmas = [...new Set(students.map(s => s.turma))];
    return ['Todas', ...uniqueTurmas.sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedTurma === 'Todas') return students;
    return students.filter(student => student.turma === selectedTurma);
  }, [students, selectedTurma]);

  const studentIdsInFilteredTurma = useMemo(() => {
    return new Set(filteredStudents.map(s => s.id));
  }, [filteredStudents]);

  const filteredLogs = useMemo(() => {
    if (selectedTurma === 'Todas') return attendanceLogs;
    return attendanceLogs.filter(log => studentIdsInFilteredTurma.has(log.alunoId));
  }, [attendanceLogs, studentIdsInFilteredTurma, selectedTurma]);

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    setInsights('');
    try {
      const insightText = await generateDashboardInsights(filteredStudents, filteredLogs);
      setInsights(insightText);
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights("Ocorreu um erro ao gerar os insights. Verifique o console e sua chave de API do Gemini.");
    } finally {
      setIsLoadingInsights(false);
    }
  };
  
  const formattedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [filteredLogs]);

  const averageEngagement = useMemo(() => {
    if (filteredLogs.length === 0) return 0;
    const totalEngagement = filteredLogs.reduce((acc, log) => acc + log.indiceEngajamento, 0);
    return Math.round(totalEngagement / filteredLogs.length);
  }, [filteredLogs]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-indigo-400">Dashboard Inteligente</h2>
        <div className="flex items-center space-x-2">
            <label htmlFor="turma-filter" className="text-sm font-medium text-gray-400">Filtrar por Turma:</label>
            <select
                id="turma-filter"
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            >
                {turmas.map(turma => (
                    <option key={turma} value={turma}>{turma}</option>
                ))}
            </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4"><UsersIcon /><p className="text-lg"><strong>{filteredStudents.length}</strong> Alunos na Visualização</p></div>
        <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4"><ClockIcon /><p className="text-lg"><strong>{filteredLogs.length}</strong> Registros na Visualização</p></div>
        <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4"><ChartBarIcon /><p className="text-lg"><strong>{averageEngagement}%</strong> Engajamento Médio</p></div>
        <button onClick={handleGenerateInsights} disabled={isLoadingInsights} className="bg-indigo-600 hover:bg-indigo-700 transition-colors p-6 rounded-lg flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed">
            <BrainIcon />
            <p className="text-lg font-semibold">{isLoadingInsights ? 'Analisando...' : 'Gerar Insights'}</p>
        </button>
      </div>

      {isLoadingInsights && (
        <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      )}
      {insights && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-indigo-400 flex items-center space-x-2"><BrainIcon /><span>Insights do Gemini AI</span></h3>
          <div className="prose prose-invert text-gray-300" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }}></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">Engajamento por Turma</h3>
            <EngagementChart data={filteredLogs} students={filteredStudents} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">Engajamento por Disciplina</h3>
            <EngagementBySubjectChart data={filteredLogs} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-indigo-400">Últimos Registros de Ponto</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3">Aluno</th>
                  <th className="p-3">Disciplina</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Horário</th>
                  <th className="p-3">Emoção</th>
                  <th className="p-3">Engajamento</th>
                </tr>
              </thead>
              <tbody>
                {formattedLogs.slice(0, 10).map(log => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3 font-medium">{log.alunoNome}</td>
                    <td className="p-3 text-gray-400">{log.disciplina}</td>
                    <td className="p-3 capitalize">{log.tipo}</td>
                    <td className="p-3 text-gray-400">{log.timestamp.toLocaleTimeString()}</td>
                    <td className={`p-3 font-semibold ${EMOTION_COLORS[log.emocaoDetectada]}`}>
                      {EMOTION_EMOJIS[log.emocaoDetectada]} {log.emocaoDetectada}
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${log.indiceEngajamento}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-indigo-400">Alunos Cadastrados</h3>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {filteredStudents.map(student => (
              <li key={student.id}>
                <button
                    onClick={() => setSelectedStudent(student)}
                    className="flex items-center space-x-3 bg-gray-700 p-2 rounded-md w-full text-left hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={`Ver histórico de ${student.nome}`}
                >
                  <img src={student.urlFoto} alt={student.nome} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{student.nome}</p>
                    <p className="text-xs text-gray-400">{student.curso} - {student.turma}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {selectedStudent && (
        <StudentHistoryModal
            student={selectedStudent}
            logs={attendanceLogs.filter(log => log.alunoId === selectedStudent.id)}
            onClose={() => setSelectedStudent(null)}
            addTherapistNote={addTherapistNote}
        />
    )}
    </div>
  );
};

export default Dashboard;