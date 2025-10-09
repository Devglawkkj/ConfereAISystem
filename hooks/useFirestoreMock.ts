import { useState } from 'react';
import { Student, AttendanceLog, TherapistNote, Grade } from '../types';

// Mock Data
const initialStudents: Student[] = [
  {
    id: 'student-1',
    nome: 'Alice Silva',
    cpf: '111.111.111-11',
    ra: 'RA11111',
    turma: 'Turma A',
    curso: 'Ciência da Computação',
    email: 'alice.silva@example.com',
    urlFoto: 'https://picsum.photos/seed/alice/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-01-15T09:00:00Z'),
    historicoDeNotas: [
        { disciplina: 'Cálculo I', nota: 8.5 },
        { disciplina: 'Algoritmos', nota: 9.5 },
    ],
    observacoesTerapeuta: [
        { id: 'note-1', terapeutaNome: 'Dr. Santos', data: new Date(new Date().setDate(new Date().getDate() - 10)), texto: 'Alice demonstra grande aptidão para lógica, mas relata ansiedade antes de provas de cálculo. Recomendo técnicas de respiração.'}
    ]
  },
  {
    id: 'student-2',
    nome: 'Bruno Costa',
    cpf: '222.222.222-22',
    ra: 'RA22222',
    turma: 'Turma B',
    curso: 'Engenharia de Software',
    email: 'bruno.costa@example.com',
    urlFoto: 'https://picsum.photos/seed/bruno/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-01-16T10:30:00Z'),
    historicoDeNotas: [
        { disciplina: 'Design de UI/UX', nota: 9.0 },
        { disciplina: 'Projeto de Software', nota: 8.0 },
    ],
    observacoesTerapeuta: []
  },
  {
    id: 'student-3',
    nome: 'Carlos Souza',
    cpf: '333.333.333-33',
    ra: 'RA33333',
    turma: 'Turma A',
    curso: 'Ciência da Computação',
    email: 'carlos.souza@example.com',
    urlFoto: 'https://picsum.photos/seed/carlos/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-02-01T08:00:00Z'),
    historicoDeNotas: [
        { disciplina: 'Cálculo I', nota: 6.5 },
        { disciplina: 'Algoritmos', nota: 7.0 },
    ],
    observacoesTerapeuta: [
        { id: 'note-2', terapeutaNome: 'Dr. Santos', data: new Date(new Date().setDate(new Date().getDate() - 5)), texto: 'Carlos parece desmotivado nas aulas de Algoritmos, o que reflete em suas notas. Engajamento aumenta em atividades práticas em grupo.'}
    ]
  },
  {
    id: 'student-4',
    nome: 'Daniela Lima',
    cpf: '444.444.444-44',
    ra: 'RA44444',
    turma: 'Turma C',
    curso: 'Design Digital',
    email: 'daniela.lima@example.com',
    urlFoto: 'https://picsum.photos/seed/daniela/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-02-05T11:00:00Z'),
    historicoDeNotas: [],
    observacoesTerapeuta: []
  },
  {
    id: 'student-5',
    nome: 'Eduardo Martins',
    cpf: '555.555.555-55',
    ra: 'RA55555',
    turma: 'Turma B',
    curso: 'Engenharia de Software',
    email: 'eduardo.martins@example.com',
    urlFoto: 'https://picsum.photos/seed/eduardo/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-03-10T14:00:00Z'),
    historicoDeNotas: [],
    observacoesTerapeuta: []
  },
  {
    id: 'student-6',
    nome: 'Fernanda Alves',
    cpf: '666.666.666-66',
    ra: 'RA66666',
    turma: 'Turma C',
    curso: 'Design Digital',
    email: 'fernanda.alves@example.com',
    urlFoto: 'https://picsum.photos/seed/fernanda/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-03-11T09:30:00Z'),
    historicoDeNotas: [],
    observacoesTerapeuta: []
  },
  {
    id: 'student-7',
    nome: 'Gabriel Pereira',
    cpf: '777.777.777-77',
    ra: 'RA77777',
    turma: 'Turma A',
    curso: 'Ciência da Computação',
    email: 'gabriel.pereira@example.com',
    urlFoto: 'https://picsum.photos/seed/gabriel/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-03-12T13:00:00Z'),
    historicoDeNotas: [],
    observacoesTerapeuta: []
  },
  {
    id: 'student-8',
    nome: 'Heloisa Ribeiro',
    cpf: '888.888.888-88',
    ra: 'RA88888',
    turma: 'Turma B',
    curso: 'Engenharia de Software',
    email: 'heloisa.ribeiro@example.com',
    urlFoto: 'https://picsum.photos/seed/heloisa/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-03-15T15:00:00Z'),
    historicoDeNotas: [],
    observacoesTerapeuta: []
  },
  {
    id: 'student-9',
    nome: 'Igor Santos',
    cpf: '999.999.999-99',
    ra: 'RA99999',
    turma: 'Turma D',
    curso: 'Redes de Computadores',
    email: 'igor.santos@example.com',
    urlFoto: 'https://picsum.photos/seed/igor/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-04-01T08:30:00Z'),
    historicoDeNotas: [{ disciplina: 'Segurança da Informação', nota: 9.2 }],
    observacoesTerapeuta: []
  },
  {
    id: 'student-10',
    nome: 'Julia Oliveira',
    cpf: '101.010.101-01',
    ra: 'RA10101',
    turma: 'Turma E',
    curso: 'Marketing Digital',
    email: 'julia.oliveira@example.com',
    urlFoto: 'https://picsum.photos/seed/julia/200/200',
    biometriaFacial: [],
    dataCadastro: new Date('2023-04-02T09:00:00Z'),
    historicoDeNotas: [],
    observacoesTerapeuta: [
        { id: 'note-3', terapeutaNome: 'Dr. Santos', data: new Date(new Date().setDate(new Date().getDate() - 2)), texto: 'Julia é extremamente criativa e participativa nas aulas de Branding, mas demonstra insegurança ao apresentar projetos.'}
    ]
  },
  { id: 'student-11', nome: 'Lucas Martins', cpf: '112.233.445-56', ra: 'RA11223', turma: 'Turma D', curso: 'Redes de Computadores', email: 'lucas.martins@example.com', urlFoto: 'https://picsum.photos/seed/lucas/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-12', nome: 'Mariana Costa', cpf: '223.344.556-67', ra: 'RA22334', turma: 'Turma E', curso: 'Marketing Digital', email: 'mariana.costa@example.com', urlFoto: 'https://picsum.photos/seed/mariana/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-13', nome: 'Nicolas Almeida', cpf: '334.455.667-78', ra: 'RA33445', turma: 'Turma A', curso: 'Ciência da Computação', email: 'nicolas.almeida@example.com', urlFoto: 'https://picsum.photos/seed/nicolas/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-14', nome: 'Olivia Barros', cpf: '445.566.778-89', ra: 'RA44556', turma: 'Turma B', curso: 'Engenharia de Software', email: 'olivia.barros@example.com', urlFoto: 'https://picsum.photos/seed/olivia/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-15', nome: 'Pedro Rocha', cpf: '556.677.889-90', ra: 'RA55667', turma: 'Turma C', curso: 'Design Digital', email: 'pedro.rocha@example.com', urlFoto: 'https://picsum.photos/seed/pedro/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-16', nome: 'Quintino Gomes', cpf: '667.788.990-01', ra: 'RA66778', turma: 'Turma D', curso: 'Redes de Computadores', email: 'quintino.gomes@example.com', urlFoto: 'https://picsum.photos/seed/quintino/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-17', nome: 'Rafael Souza', cpf: '778.899.001-12', ra: 'RA77889', turma: 'Turma E', curso: 'Marketing Digital', email: 'rafael.souza@example.com', urlFoto: 'https://picsum.photos/seed/rafael/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
  { id: 'student-18', nome: 'Sofia Ferreira', cpf: '889.900.112-23', ra: 'RA88990', turma: 'Turma A', curso: 'Ciência da Computação', email: 'sofia.ferreira@example.com', urlFoto: 'https://picsum.photos/seed/sofia/200/200', biometriaFacial: [], dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] },
];

const mockSchedule: Record<string, Record<string, string>> = {
  'Turma A': { '08-10': 'Cálculo I', '10-12': 'Algoritmos' },
  'Turma B': { '08-10': 'Design de UI/UX', '10-12': 'Projeto de Software' },
  'Turma C': { '08-10': 'Ilustração Vetorial', '10-12': 'História da Arte' },
  'Turma D': { '08-10': 'Segurança da Informação', '10-12': 'Inteligência Artificial' },
  'Turma E': { '08-10': 'Branding', '10-12': 'Fotografia Publicitária' },
};

const getAcademicContext = (studentId: string, students: Student[], timestamp: Date): { disciplina: string, periodo: 'Manhã' | 'Tarde' } => {
    const student = students.find(s => s.id === studentId);
    const hour = timestamp.getHours();
    const period = hour < 12 ? 'Manhã' : 'Tarde';

    if (!student || period === 'Tarde') {
        return { disciplina: 'Atividade Geral', periodo: period };
    }

    const turmaSchedule = mockSchedule[student.turma];
    if (!turmaSchedule) {
        return { disciplina: 'Atividade Geral', periodo: period };
    }
    
    if (hour >= 8 && hour < 10) return { disciplina: turmaSchedule['08-10'], periodo: period };
    if (hour >= 10 && hour < 12) return { disciplina: turmaSchedule['10-12'], periodo: period };
    
    return { disciplina: 'Intervalo', periodo: period };
};


const initialLogs: AttendanceLog[] = [
    { id: 'log-1', alunoId: 'student-1', alunoNome: 'Alice Silva', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 2, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 75, disciplina: 'Cálculo I', periodo: 'Manhã'},
    { id: 'log-2', alunoId: 'student-2', alunoNome: 'Bruno Costa', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 5, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Neutro', indiceEngajamento: 50, disciplina: 'Design de UI/UX', periodo: 'Manhã'},
    { id: 'log-3', alunoId: 'student-3', alunoNome: 'Carlos Souza', tipo: 'entrada', timestamp: new Date(new Date().setHours(10, 1, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Baixa Excitação', indiceEngajamento: 35, disciplina: 'Algoritmos', periodo: 'Manhã'},
    { id: 'log-4', alunoId: 'student-4', alunoNome: 'Daniela Lima', tipo: 'entrada', timestamp: new Date(new Date().setHours(9, 15, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Alta Excitação', indiceEngajamento: 45, disciplina: 'Ilustração Vetorial', periodo: 'Manhã'},
    { id: 'log-5', alunoId: 'student-1', alunoNome: 'Alice Silva', tipo: 'saida', timestamp: new Date(new Date().setHours(12, 30, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 80, disciplina: 'Atividade Geral', periodo: 'Tarde'},
    { id: 'log-6', alunoId: 'student-2', alunoNome: 'Bruno Costa', tipo: 'saida', timestamp: new Date(new Date().setHours(12, 35, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Baixa Valência', indiceEngajamento: 30, disciplina: 'Atividade Geral', periodo: 'Tarde'},
    { id: 'log-7', alunoId: 'student-5', alunoNome: 'Eduardo Martins', tipo: 'entrada', timestamp: new Date(new Date().setHours(10, 8, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Neutro', indiceEngajamento: 60, disciplina: 'Projeto de Software', periodo: 'Manhã'},
    { id: 'log-8', alunoId: 'student-6', alunoNome: 'Fernanda Alves', tipo: 'entrada', timestamp: new Date(new Date().setHours(9, 5, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 85, disciplina: 'Ilustração Vetorial', periodo: 'Manhã'},
    { id: 'log-9', alunoId: 'student-7', alunoNome: 'Gabriel Pereira', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 0, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 90, disciplina: 'Cálculo I', periodo: 'Manhã'},
    { id: 'log-10', alunoId: 'student-8', alunoNome: 'Heloisa Ribeiro', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 12, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Baixa Valência', indiceEngajamento: 40, disciplina: 'Design de UI/UX', periodo: 'Manhã'},
    { id: 'log-11', alunoId: 'student-9', alunoNome: 'Igor Santos', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 3, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 88, disciplina: 'Segurança da Informação', periodo: 'Manhã'},
    { id: 'log-12', alunoId: 'student-10', alunoNome: 'Julia Oliveira', tipo: 'entrada', timestamp: new Date(new Date().setHours(10, 10, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Alta Excitação', indiceEngajamento: 55, disciplina: 'Fotografia Publicitária', periodo: 'Manhã'},
    { id: 'log-13', alunoId: 'student-11', alunoNome: 'Lucas Martins', tipo: 'entrada', timestamp: new Date(new Date().setHours(10, 5, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Neutro', indiceEngajamento: 65, disciplina: 'Inteligência Artificial', periodo: 'Manhã'},
    { id: 'log-14', alunoId: 'student-12', alunoNome: 'Mariana Costa', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 8, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 78, disciplina: 'Branding', periodo: 'Manhã'},
    { id: 'log-15', alunoId: 'student-13', alunoNome: 'Nicolas Almeida', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 1, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Neutro', indiceEngajamento: 55, disciplina: 'Cálculo I', periodo: 'Manhã'},
    { id: 'log-16', alunoId: 'student-14', alunoNome: 'Olivia Barros', tipo: 'saida', timestamp: new Date(new Date().setHours(12, 40, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 70, disciplina: 'Atividade Geral', periodo: 'Tarde'},
    { id: 'log-17', alunoId: 'student-9', alunoNome: 'Igor Santos', tipo: 'saida', timestamp: new Date(new Date().setHours(12, 33, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 90, disciplina: 'Atividade Geral', periodo: 'Tarde'},
    { id: 'log-18', alunoId: 'student-15', alunoNome: 'Pedro Rocha', tipo: 'entrada', timestamp: new Date(new Date().setHours(10, 15, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Baixa Excitação', indiceEngajamento: 40, disciplina: 'História da Arte', periodo: 'Manhã'},
    { id: 'log-19', alunoId: 'student-16', alunoNome: 'Quintino Gomes', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 20, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Alta Excitação', indiceEngajamento: 48, disciplina: 'Segurança da Informação', periodo: 'Manhã'},
    { id: 'log-20', alunoId: 'student-17', alunoNome: 'Rafael Souza', tipo: 'entrada', timestamp: new Date(new Date().setHours(8, 0, 0)), statusReconhecimento: 'reconhecido', emocaoDetectada: 'Afeto Positivo', indiceEngajamento: 95, disciplina: 'Branding', periodo: 'Manhã'},
];


const GlobalStore = (() => {
    let students = initialStudents;
    let attendanceLogs = initialLogs;
    let listeners: (()=>void)[] = [];

    const subscribe = (listener: ()=>void) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        }
    }

    const notify = () => {
        listeners.forEach(l => l());
    }

    return {
        getStudents: () => students,
        getLogs: () => attendanceLogs,
        addStudent: (studentData: Omit<Student, 'id' | 'dataCadastro' | 'historicoDeNotas' | 'observacoesTerapeuta'>) => {
            students = [...students, { ...studentData, id: `student-${Date.now()}`, dataCadastro: new Date(), historicoDeNotas: [], observacoesTerapeuta: [] }];
            notify();
        },
        addLog: (logData: Omit<AttendanceLog, 'id' | 'disciplina' | 'periodo'>) => {
            const context = getAcademicContext(logData.alunoId, students, logData.timestamp);
            const newLog: AttendanceLog = {
                ...logData,
                id: `log-${Date.now()}`,
                disciplina: context.disciplina,
                periodo: context.periodo,
            };
            attendanceLogs = [...attendanceLogs, newLog];
            notify();
        },
        addTherapistNote: (alunoId: string, noteText: string) => {
            students = students.map(student => {
                if (student.id === alunoId) {
                    const newNote: TherapistNote = {
                        id: `note-${Date.now()}`,
                        terapeutaNome: 'Dr. Santos', // Mocked therapist name
                        data: new Date(),
                        texto: noteText,
                    };
                    return { ...student, observacoesTerapeuta: [...student.observacoesTerapeuta, newNote] };
                }
                return student;
            });
            notify();
        },
        subscribe,
    }
})();

export const useFirestoreMock = () => {
    const [, forceUpdate] = useState({});

    useState(() => {
       const unsubscribe = GlobalStore.subscribe(() => forceUpdate({}));
       return () => unsubscribe();
    });

    return {
        students: GlobalStore.getStudents(),
        attendanceLogs: GlobalStore.getLogs(),
        addStudent: GlobalStore.addStudent,
        addAttendanceLog: GlobalStore.addLog,
        addTherapistNote: GlobalStore.addTherapistNote,
    }
}