import { GoogleGenAI } from "@google/genai";
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Emotion, Student, AttendanceLog } from '../types';

let ai: GoogleGenAI | null = null;

// Initializes the GoogleGenAI instance on the first call (singleton pattern).
// The application now assumes the API_KEY is available as an environment variable.
const getAI = (): GoogleGenAI => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

// Function to simplify landmarks for the prompt
const createFacialMetricsPrompt = (landmarks: NormalizedLandmark[]): string => {
    const getPoint = (index: number) => ({ x: landmarks[index].x, y: landmarks[index].y });
    
    // Eyebrows (distance from eyes)
    const leftEyebrowInner = getPoint(65);
    const leftEyeUpper = getPoint(159);
    const rightEyebrowInner = getPoint(295);
    const rightEyeUpper = getPoint(386);

    // Mouth corners
    const mouthLeft = getPoint(61);
    const mouthRight = getPoint(291);
    const mouthTop = getPoint(0);
    const mouthBottom = getPoint(17);

    const mouthAspectRatio = Math.hypot(mouthTop.x - mouthBottom.x, mouthTop.y - mouthBottom.y) / Math.hypot(mouthLeft.x - mouthRight.x, mouthLeft.y - mouthRight.y);
    const eyebrowLiftLeft = Math.hypot(leftEyebrowInner.x - leftEyeUpper.x, leftEyebrowInner.y - leftEyeUpper.y);
    const eyebrowLiftRight = Math.hypot(rightEyebrowInner.x - rightEyeUpper.x, rightEyebrowInner.y - rightEyeUpper.y);
    
    return `
    Métricas faciais derivadas dos pontos de referência:
    - Proporção da Boca (maior indica mais aberta/sorrindo): ${mouthAspectRatio.toFixed(3)}
    - Distância Sobrancelha Esquerda ao Olho: ${eyebrowLiftLeft.toFixed(3)}
    - Distância Sobrancelha Direita ao Olho: ${eyebrowLiftRight.toFixed(3)}
    `;
};


export const analyzeEmotions = async (landmarks: NormalizedLandmark[]): Promise<Emotion> => {
    const genAI = getAI();
    const facialMetrics = createFacialMetricsPrompt(landmarks);
    const prompt = `
    Analise as seguintes métricas faciais para determinar o estado emocional dominante.
    Escolha APENAS da seguinte lista: 'Afeto Positivo' (alegria/satisfação), 'Baixa Valência' (tristeza/desânimo), 'Alta Excitação' (tensão/estresse), 'Baixa Excitação' (fadiga/desmotivação), 'Neutro'.
    Responda APENAS com o nome do estado emocional da lista.

    ${facialMetrics}
    `;

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text.trim().replace(/'/g, "");
        const validEmotions: Emotion[] = ['Afeto Positivo', 'Baixa Valência', 'Alta Excitação', 'Baixa Excitação', 'Neutro'];
        
        if (validEmotions.includes(text as Emotion)) {
            return text as Emotion;
        } else {
            console.warn(`Gemini retornou uma emoção inválida: "${text}". Usando "Neutro" como padrão.`);
            return 'Neutro';
        }
    } catch (error) {
        console.error("Erro ao chamar a API Gemini para análise de emoções:", error);
        // Retorna 'Neutro' como fallback para não quebrar a UI em tempo real.
        return 'Neutro';
    }
};

export const generateDashboardInsights = async (students: Student[], logs: AttendanceLog[]): Promise<string> => {
    const genAI = getAI();
    
    if (logs.length === 0) {
        return "Não há dados suficientes para gerar insights. Por favor, selecione uma turma com registros.";
    }

    const dataSummary = logs.map(log => ({
        aluno: log.alunoNome,
        timestamp: log.timestamp.toISOString(),
        emocao: log.emocaoDetectada,
        engajamento: log.indiceEngajamento,
        disciplina: log.disciplina,
    }));

    const prompt = `
    Você é uma IA analista de dados educacionais. Analise os seguintes dados de presença e emoção dos alunos de um dia e forneça três insights importantes e acionáveis para educadores.
    A resposta deve ser em português do Brasil.
    Formate a saída como uma lista com marcadores usando markdown (*).
    Concentre-se em tendências de engajamento, sinais de estresse ou fadiga, destaques positivos e possíveis correlações entre emoções/engajamento e as disciplinas acadêmicas.
    
    Dados:
    ${JSON.stringify(dataSummary, null, 2)}
    `;

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Erro ao chamar a API Gemini para insights:", error);
        throw new Error("Falha ao gerar insights. Verifique a chave de API e a conexão.");
    }
};

export const generateStudentReport = async (student: Student, logs: AttendanceLog[]): Promise<string> => {
    const genAI = getAI();

    const logSummary = logs.map(log => ({
        tipo: log.tipo,
        horario: log.timestamp.toLocaleString('pt-BR'),
        emocao: log.emocaoDetectada,
        engajamento: log.indiceEngajamento,
        disciplina: log.disciplina,
    }));

    if (logSummary.length === 0 && student.observacoesTerapeuta.length === 0) {
        return "Não há dados suficientes para gerar uma análise para este aluno.";
    }

    const prompt = `
    Você é um membro de uma equipe psicopedagógica e está analisando dados holísticos de um(a) aluno(a).
    Seu objetivo é criar um relatório conciso (2-3 parágrafos) para educadores, cruzando todas as fontes de dados disponíveis.
    
    **Dados do(a) Aluno(a): ${student.nome}**

    **1. Histórico de Registros (Biometria Facial e Emoções):**
    ${JSON.stringify(logSummary, null, 2)}

    **2. Histórico de Notas:**
    ${JSON.stringify(student.historicoDeNotas, null, 2)}

    **3. Observações da Psicoterapeuta:**
    ${JSON.stringify(student.observacoesTerapeuta, null, 2)}

    **Sua Tarefa:**
    Analise e sintetize TODAS as informações acima. No seu relatório, aborde:
    - **Correlações:** Existe alguma ligação entre o estado emocional (detectado pela biometria) e o desempenho (notas) em certas disciplinas? As observações da psicoterapeuta confirmam ou contradizem os padrões vistos nos dados biométricos?
    - **Padrões Comportamentais:** Identifique padrões de engajamento, pontualidade, e possíveis sinais de alerta (ex: estresse recorrente antes de uma aula específica, que pode ou não estar refletido nas notas).
    - **Recomendação Acionável:** Com base na sua análise completa, forneça uma ou duas recomendações práticas e sutis para o educador (ex: "sugerir uma conversa de alinhamento", "propor atividades em grupo", "reforçar positivamente o esforço").

    A resposta deve ser em português do Brasil, formatada em markdown com parágrafos e negritos para destaque, em um tom profissional e colaborativo.
    `;

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error(`Erro ao gerar relatório para ${student.nome}:`, error);
        throw new Error("Falha ao gerar relatório do aluno. Verifique a chave de API e a conexão.");
    }
};