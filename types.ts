import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type Page = 'about' | 'dashboard' | 'register' | 'attendance';

export interface Grade {
  disciplina: string;
  nota: number;
}

export interface TherapistNote {
  id: string;
  terapeutaNome: string;
  data: Date;
  texto: string;
}

export interface Student {
  id: string;
  nome: string;
  cpf: string;
  ra: string;
  turma: string;
  curso: string;
  email: string;
  urlFoto: string; // data URL
  biometriaFacial: NormalizedLandmark[];
  dataCadastro: Date;
  historicoDeNotas: Grade[];
  observacoesTerapeuta: TherapistNote[];
}

export type Emotion = 'Afeto Positivo' | 'Baixa Valência' | 'Alta Excitação' | 'Baixa Excitação' | 'Neutro' | 'Analisando...';

export interface AttendanceLog {
  id: string;
  alunoId: string;
  alunoNome: string;
  tipo: 'entrada' | 'saida';
  timestamp: Date;
  statusReconhecimento: 'reconhecido' | 'nao_reconhecido';
  emocaoDetectada: Emotion;
  indiceEngajamento: number;
  disciplina: string;
  periodo: 'Manhã' | 'Tarde';
}