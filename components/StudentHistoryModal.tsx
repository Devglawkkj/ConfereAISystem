import React, { useState, useMemo, useEffect } from 'react';
import { Student, AttendanceLog, TherapistNote } from '../types';
import { generateStudentReport } from '../services/geminiService';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../constants';
import { BrainIcon, XIcon, ClipboardListIcon, ClockIcon, PlusCircleIcon, SparklesIcon } from './icons/Icons';
import { collection, query, onSnapshot, orderBy, Timestamp, getFirestore } from 'firebase/firestore';

interface StudentHistoryModalProps {
  student: Student;
  logs: AttendanceLog[];
  onClose: () => void;
  addTherapistNote: (alunoId: string, noteText: string) => void;
}

const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({ student, logs, onClose, addTherapistNote }) => {
  const [report, setReport] = useState<string>('');
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [newNote, setNewNote] = useState('');
  const [therapistNotes, setTherapistNotes] = useState<TherapistNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs]);

  useEffect(() => {
    if (!student?.id) return;
    
    setIsLoadingNotes(true);
    const db = getFirestore();
    const notesCollection = collection(db, 'students', student.id, 'therapistNotes');
    const q = query(notesCollection, orderBy('data', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        // FIX: The generic type argument on .reduce() can cause issues with some TypeScript configurations.
        // Moved the type to an assertion on the initial value to ensure correct type inference.
        const fetchedNotes = snapshot.docs.reduce((acc, doc) => {
            try {
                const data = doc.data();
                if (data.data instanceof Timestamp) {
                    // Mapeamento explícito para criar um objeto puro
                    const cleanNote: TherapistNote = {
                        id: doc.id,
                        terapeutaNome: data.terapeutaNome,
                        data: data.data.toDate(),
                        texto: data.texto,
                    };
                    acc.push(cleanNote);
                } else {
                    console.warn(`Ignorando nota de terapeuta com data malformada: ${doc.id}`);
                }
            } catch (e) {
                console.error(`Erro ao processar nota de terapeuta ${doc.id}:`, e);
            }
            return acc;
        }, [] as TherapistNote[]);
        setTherapistNotes(fetchedNotes);
        setIsLoadingNotes(false);
    }, (error) => {
        console.error("Error fetching therapist notes: ", error);
        setIsLoadingNotes(false);
    });

    return () => unsubscribe();
  }, [student?.id]);

  const handleGenerateReport = async () => {
    setIsLoadingReport(true);
    setReport('');
    try {
      const generatedReport = await generateStudentReport(student, sortedLogs, therapistNotes);
      setReport(generatedReport);
    } catch (error) {
      console.error("Error generating student report:", error);
      setReport("Ocorreu um erro ao gerar a análise. Tente novamente.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
        addTherapistNote(student.id, newNote.trim());
        setNewNote('');
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-400">Visão 360º do Aluno</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Fechar modal">
            <XIcon />
          </button>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img src={student.urlFoto} alt={student.nome} className="w-24 h-24 rounded-full object-cover border-4 border-gray-700" />
              <div>
                <h3 className="text-xl font-bold">{student.nome}</h3>
                <p className="text-gray-400">{student.curso}</p>
                <p className="text-sm text-gray-500">RA: {student.ra} - Turma: {student.turma}</p>
              </div>
            </div>

            {/* Attendance History */}
            <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center space-x-2"><ClockIcon className="w-5 h-5 text-indigo-400"/><span>Histórico de Ponto</span></h4>
              <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded-md">
                 {sortedLogs.length > 0 ? (
                  <table className="w-full text-left">
                      <thead className="sticky top-0 bg-gray-700">
                        <tr>
                          <th className="p-3 text-sm">Data</th>
                          <th className="p-3 text-sm">Disciplina</th>
                          <th className="p-3 text-sm">Tipo</th>
                          <th className="p-3 text-sm">Emoção</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedLogs.map(log => (
                          <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="p-2 text-xs text-gray-400">{log.timestamp.toLocaleDateString()} <br/> {log.timestamp.toLocaleTimeString()}</td>
                            <td className="p-2 text-xs text-gray-400">{log.disciplina}</td>
                            <td className="p-2 text-xs capitalize">{log.tipo}</td>
                            <td className={`p-2 text-xs font-semibold ${EMOTION_COLORS[log.emocaoDetectada]}`}>
                              {EMOTION_EMOJIS[log.emocaoDetectada]} {log.emocaoDetectada}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                 ) : (
                  <p className="p-4 text-center text-gray-500">Nenhum registro de ponto.</p>
                 )}
              </div>
            </div>

             {/* AI Analysis */}
            <div>
              <h4 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center space-x-2"><BrainIcon className="w-5 h-5 text-indigo-400"/><span>Análise Holística da IA</span></h4>
              {!report && !isLoadingReport && (
                <button onClick={handleGenerateReport} className="btn-primary flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Gerar Análise Holística</span>
                </button>
              )}
              {isLoadingReport && (
                  <div className="bg-gray-700 p-4 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-600 rounded w-1/3 mb-3"></div>
                      <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded w-5/6"></div>
                  </div>
              )}
              {report && (
                  <div className="bg-gray-900/50 p-4 rounded-lg prose prose-invert text-gray-300 max-w-none" dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
                  </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Therapist Notes */}
            <div>
               <h4 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center space-x-2"><ClipboardListIcon className="w-5 h-5 text-indigo-400"/><span>Observações da Psicoterapeuta</span></h4>
               <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-900/50 rounded-md p-3">
                    {isLoadingNotes ? <p className="p-4 text-center text-sm text-gray-500">Carregando notas...</p> :
                    therapistNotes.length > 0 ? (
                        therapistNotes.map(note => (
                            <div key={note.id} className="bg-gray-700/50 p-3 rounded-md">
                                <p className="text-xs text-gray-400 mb-1">
                                    <span className="font-semibold">{note.terapeutaNome}</span> - {note.data.toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-300">{note.texto}</p>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-gray-500">Nenhuma observação registrada.</p>
                    )}
               </div>
               <form onSubmit={handleAddNote} className="mt-3 flex space-x-2">
                   <input 
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nova observação..."
                    className="input-style flex-grow"
                   />
                   <button type="submit" className="btn-secondary p-2.5" aria-label="Adicionar Observação"><PlusCircleIcon className="w-5 h-5"/></button>
               </form>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

const globalStyles = `
  .input-style {
    background-color: #1F2937;
    border: 1px solid #4B5563;
    color: #F9FAFB;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    width: 100%;
    font-size: 0.875rem;
  }
  .input-style:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  }
  .btn-primary {
    background-color: #4F46E5;
    color: white;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
    font-size: 0.875rem;
  }
  .btn-primary:hover {
    background-color: #4338CA;
  }
  .btn-secondary {
    background-color: #374151;
    color: white;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
    font-size: 0.875rem;
  }
  .btn-secondary:hover {
    background-color: #4B5563;
  }
`;

const styleSheet = document.createElement("style");
if (!document.querySelector('#student-history-styles')) {
    styleSheet.id = 'student-history-styles';
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
}


export default StudentHistoryModal;