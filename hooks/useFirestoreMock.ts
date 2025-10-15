import { useState, useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
    getFirestore, 
    Firestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    Timestamp,
    query,
    orderBy,
    FirestoreError
} from 'firebase/firestore';
import { 
    getStorage, 
    FirebaseStorage, 
    ref, 
    uploadString, 
    getDownloadURL 
} from 'firebase/storage';
import { Student, AttendanceLog, TherapistNote, Grade } from '../types';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

const firebaseConfig = {
  apiKey: "AIzaSyDmLnD1vIfqF0gcQdYRz6eypvBxSkwYnd4",
  authDomain: "bdconfereai.firebaseapp.com",
  projectId: "bdconfereai",
  storageBucket: "bdconfereai.appspot.com",
  messagingSenderId: "627971053699",
  appId: "1:627971053699:web:f7fde699dfa03d8f3aa3b6"
};

// Inicializa o Firebase de forma segura para evitar re-inicializações (padrão singleton)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// O nome do arquivo é useFirestoreMock.ts, mas este é o hook REAL de conexão.
export const useFirestore = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setError("CONFIGURAÇÃO DO FIREBASE INCOMPLETA OU INVÁLIDA. Verifique o objeto de configuração no arquivo hooks/useFirestoreMock.ts.");
      setLoading(false);
      return;
    }

    const studentsCollection = collection(db, 'students');
    const q = query(studentsCollection, orderBy('nome', 'asc'));

    const handleFirestoreError = (err: FirestoreError, context: string) => {
        console.error(`Erro no Firestore (${context}):`, err.code, err.message);
        let userMessage = `Não foi possível carregar ${context}.`;
        if (err.code === 'permission-denied') {
            userMessage = `PERMISSÃO NEGADA ao carregar ${context}. Por favor, verifique se as Regras de Segurança do Cloud Firestore estão configuradas para permitir leitura ('allow read: if true;').`;
        } else if (err.code === 'unauthenticated') {
            userMessage = `NÃO AUTENTICADO para carregar ${context}. Suas regras do Firestore podem exigir login.`;
        }
        setError(userMessage);
        setLoading(false);
    };

    const unsubscribeStudents = onSnapshot(q, (snapshot) => {
      const studentsData: Student[] = [];
      snapshot.forEach(doc => {
        try {
          const data = doc.data();
          
          if (!data.nome || !data.ra || !data.dataCadastro) {
            console.warn(`Ignorando documento de aluno malformado: ${doc.id}`);
            return;
          }
          
          const biometria: NormalizedLandmark[] = (data.biometriaFacial || []).map((lm: any) => ({
            x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility
          }));

          const notas: Grade[] = (data.historicoDeNotas || []).map((grade: any) => ({
            disciplina: grade.disciplina, nota: grade.nota
          }));

          studentsData.push({
            id: doc.id,
            nome: data.nome,
            cpf: data.cpf,
            ra: data.ra,
            turma: data.turma,
            curso: data.curso,
            email: data.email,
            urlFoto: data.urlFoto,
            biometriaFacial: biometria,
            dataCadastro: data.dataCadastro instanceof Timestamp ? data.dataCadastro.toDate() : new Date(),
            historicoDeNotas: notas,
          });
        } catch(e) {
            console.error(`Erro ao processar o documento do aluno ${doc.id}:`, e);
        }
      });
      setStudents(studentsData);
      setLoading(false);
      setError(null); // Limpa erros anteriores se a leitura for bem-sucedida
    }, (err: FirestoreError) => handleFirestoreError(err, 'alunos'));

    const logsCollection = collection(db, 'attendanceLogs');
    const logsQuery = query(logsCollection, orderBy('timestamp', 'desc'));

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData: AttendanceLog[] = [];
       snapshot.forEach(doc => {
         try {
            const data = doc.data();
             if (!data.timestamp || !(data.timestamp instanceof Timestamp)) {
                console.warn(`Ignorando log de presença malformado ou com timestamp inválido: ${doc.id}`);
                return;
            }
            logsData.push({
                id: doc.id,
                alunoId: data.alunoId,
                alunoNome: data.alunoNome,
                tipo: data.tipo,
                timestamp: data.timestamp.toDate(),
                statusReconhecimento: data.statusReconhecimento,
                emocaoDetectada: data.emocaoDetectada,
                indiceEngajamento: data.indiceEngajamento,
                disciplina: data.disciplina,
                periodo: data.periodo,
            });
        } catch(e) {
            console.error(`Erro ao processar o log de presença ${doc.id}:`, e);
        }
      });
      setAttendanceLogs(logsData);
    }, (err: FirestoreError) => handleFirestoreError(err, 'registros de ponto'));

    return () => {
      unsubscribeStudents();
      unsubscribeLogs();
    };
  }, []);

  const addStudent = async (studentData: Omit<Student, 'id' | 'dataCadastro' | 'historicoDeNotas'> & { urlFoto: string }) => {
    if (!db || !storage) throw new Error("Firebase não inicializado");
    
    const photoDataUrl = studentData.urlFoto;
    
    if (!photoDataUrl || !photoDataUrl.startsWith('data:image/jpeg')) {
        throw new Error("Dados da foto inválidos ou ausentes.");
    }
    
    const storagePath = `fotos_alunos/${studentData.ra}_${Date.now()}.jpg`;
    const storageRef = ref(storage, storagePath);
    
    try {
        const uploadResult = await uploadString(storageRef, photoDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(uploadResult.ref);

        const newStudent = {
            ...studentData,
            urlFoto: downloadURL,
            dataCadastro: Timestamp.now(),
            historicoDeNotas: [],
        };
        
        await addDoc(collection(db, 'students'), newStudent);
        
    } catch (error: any) {
        console.error("ERRO DETALHADO DURANTE O CADASTRO:", error.code, error.message);
        if (error.code === 'storage/unauthorized' || error.code === 'storage/retry-limit-exceeded') {
             throw new Error("PERMISSÃO NEGADA NO STORAGE. O upload da foto foi bloqueado. Verifique se as Regras de Segurança do Firebase Storage estão configuradas para permitir escrita ('allow write: if true;').");
        } else if (error.code === 'permission-denied') {
             throw new Error("PERMISSÃO NEGADA NO FIRESTORE. A foto foi enviada, mas o salvamento dos dados foi bloqueado. Verifique as Regras de Segurança do Cloud Firestore.");
        }
        throw new Error("Ocorreu um erro inesperado durante o cadastro. Verifique o console.");
    }
  };
  
  const addAttendanceLog = async (logData: Omit<AttendanceLog, 'id' | 'disciplina' | 'periodo'>) => {
    if (!db) throw new Error("Firebase não inicializado");
    
    const now = new Date();
    const currentHour = now.getHours();
    
    let disciplina = "Atividade Geral";
    if (currentHour >= 8 && currentHour < 10) disciplina = "Matemática";
    else if (currentHour >= 10 && currentHour < 12) disciplina = "Português";
    else if (currentHour >= 13 && currentHour < 15) disciplina = "Ciências";
    else if (currentHour >= 15 && currentHour < 17) disciplina = "História";

    const periodo = currentHour < 12 ? 'Manhã' : 'Tarde';

    const newLog = {
        ...logData,
        timestamp: Timestamp.fromDate(logData.timestamp),
        disciplina,
        periodo,
    };
    await addDoc(collection(db, 'attendanceLogs'), newLog);
  };
  
  const addTherapistNote = async (alunoId: string, noteText: string) => {
    if (!db) throw new Error("Firebase não inicializado");
    const notesCollection = collection(db, 'students', alunoId, 'therapistNotes');
    await addDoc(notesCollection, {
        texto: noteText,
        data: Timestamp.now(),
        terapeutaNome: 'Dr(a). Silva', 
    });
  };

  return { students, attendanceLogs, addStudent, addAttendanceLog, addTherapistNote, loading, error };
};