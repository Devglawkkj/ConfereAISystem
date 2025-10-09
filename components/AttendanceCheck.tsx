import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFirestoreMock } from '../hooks/useFirestoreMock';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { calculateSimilarity } from '../utils/facialRecognition';
import { analyzeEmotions } from '../services/geminiService';
import { Student, Emotion, AttendanceLog } from '../types';
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { SIMILARITY_THRESHOLD, EMOTION_SCORES, EMOTION_COLORS, EMOTION_EMOJIS } from '../constants';
import { XCircleIcon, UsersIcon, SparklesIcon } from './icons/Icons';
import { drawOnCanvas, DrawStatus } from '../utils/drawingUtils';

type AttendanceMode = 'recognition' | 'demonstration';

const AttendanceCheck: React.FC = () => {
    const { students, addAttendanceLog } = useFirestoreMock();
    const [mode, setMode] = useState<AttendanceMode>('recognition');
    const [statusMessage, setStatusMessage] = useState('Inicializando câmera...');
    const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
    const [detectedEmotion, setDetectedEmotion] = useState<Emotion>('Analisando...');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [lastSuccessfulCapture, setLastSuccessfulCapture] = useState<{ photo: string } | null>(null);
    const [drawStatus, setDrawStatus] = useState<DrawStatus>('detecting');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const recognitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetState = useCallback(() => {
        setRecognizedStudent(null);
        setLastSuccessfulCapture(null);
        setDetectedEmotion('Analisando...');
        if (mode === 'recognition') {
            setStatusMessage('Procurando rosto...');
            setDrawStatus('detecting');
        } else {
            setStatusMessage('Aponte a câmera para um rosto');
            setDrawStatus('demo');
        }
    }, [mode]);

    useEffect(() => {
        resetState();
    }, [mode, resetState]);

    const onResults = useCallback(async (results: FaceLandmarkerResult) => {
        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx && videoRef.current) {
            drawOnCanvas(canvasCtx, videoRef.current, results, drawStatus);
        }

        if (isProcessing) return;

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const detectedLandmarks = results.faceLandmarks[0];

            if (mode === 'recognition') {
                if (recognizedStudent) return;

                setStatusMessage('Rosto detectado. Verificando identidade...');
                setDrawStatus('detecting');

                let bestMatch: { student: Student | null, score: number } = { student: null, score: 0 };
                for (const student of students) {
                    if (student.biometriaFacial && student.biometriaFacial.length > 0) {
                        const similarity = calculateSimilarity(detectedLandmarks, student.biometriaFacial);
                        if (similarity > bestMatch.score) {
                            bestMatch = { student, score: similarity };
                        }
                    }
                }

                if (bestMatch.student && bestMatch.score >= SIMILARITY_THRESHOLD) {
                    setStatusMessage(`Bem-vindo(a), ${bestMatch.student.nome}!`);
                    setRecognizedStudent(bestMatch.student);
                    setDrawStatus('recognized');

                    let photoDataUrl = '';
                    if (videoRef.current) {
                        const canvas = document.createElement('canvas');
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                        photoDataUrl = canvas.toDataURL('image/jpeg');
                    }
                    
                    setLastSuccessfulCapture({ photo: photoDataUrl });

                    try {
                        const emotion = await analyzeEmotions(detectedLandmarks);
                        setDetectedEmotion(emotion);
                    } catch (e) {
                        console.error("Emotion analysis failed:", e);
                        setDetectedEmotion('Neutro'); 
                    }
                } else {
                    setStatusMessage('Aluno não reconhecido. Tente novamente.');
                    setDrawStatus('unrecognized');
                    if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
                    recognitionTimeoutRef.current = setTimeout(() => {
                       if (!recognizedStudent) resetState();
                    }, 2000);
                }
            } else { // mode === 'demonstration'
                setStatusMessage('Analisando visitante...');
                setDrawStatus('demo');
                if(recognizedStudent) setRecognizedStudent(null);
                
                try {
                    const emotion = await analyzeEmotions(detectedLandmarks);
                    setDetectedEmotion(emotion);
                } catch (e) {
                    console.error("Emotion analysis failed:", e);
                    setDetectedEmotion('Neutro'); 
                }
            }
        } else {
            if (mode === 'recognition' && !recognizedStudent) {
                resetState();
            } else if (mode === 'demonstration') {
                setStatusMessage('Aponte a câmera para um rosto');
                setDetectedEmotion('Analisando...');
            }
        }

    }, [students, isProcessing, recognizedStudent, resetState, mode, drawStatus]);

    const { startWebcam, stopWebcam, error: mediaPipeError } = useMediaPipe(onResults);

    useEffect(() => {
        if (videoRef.current) {
            startWebcam(videoRef.current).then(() => {
                setStatusMessage('Câmera iniciada. Procurando rosto...');
            });
        }
        return () => {
            stopWebcam();
            if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
        };
    }, [startWebcam, stopWebcam]);

    useEffect(() => {
        if (mediaPipeError) setError(mediaPipeError);
    }, [mediaPipeError]);


    const handleLogAttendance = async (type: 'entrada' | 'saida') => {
        if (!recognizedStudent || !lastSuccessfulCapture || isProcessing || detectedEmotion === 'Analisando...') {
            return;
        }

        setIsProcessing(true);
        setError('');

        const emotionScore = EMOTION_SCORES[detectedEmotion] || 0;
        const baseEngagement = 60;
        const engagementIndex = Math.max(0, Math.min(100, baseEngagement + emotionScore));

        const newLog: Omit<AttendanceLog, 'id' | 'disciplina' | 'periodo'> = {
            alunoId: recognizedStudent.id,
            alunoNome: recognizedStudent.nome,
            tipo: type,
            timestamp: new Date(),
            statusReconhecimento: 'reconhecido',
            emocaoDetectada: detectedEmotion,
            indiceEngajamento: engagementIndex,
        };

        addAttendanceLog(newLog);
        setStatusMessage(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada para ${recognizedStudent.nome}!`);

        setTimeout(() => {
            resetState();
            setIsProcessing(false);
        }, 3000);
    };
    
    const renderModeSwitcher = () => (
      <div className="flex justify-center mb-4">
          <div className="bg-gray-700 p-1 rounded-xl flex space-x-1 shadow-inner">
              <button
                  onClick={() => setMode('recognition')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      mode === 'recognition' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
                  }`}
              >
                  <UsersIcon className="w-5 h-5" />
                  <span>Reconhecimento</span>
              </button>
              <button
                  onClick={() => setMode('demonstration')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      mode === 'demonstration' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
                  }`}
              >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Demonstração</span>
              </button>
          </div>
      </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-indigo-400 mb-2 text-center">Registro de Ponto</h2>
            {renderModeSwitcher()}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover hidden"></video>
                        <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0"></canvas>
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <p className="text-xl font-semibold text-center h-8" aria-live="polite">
                        {statusMessage}
                    </p>
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-3 rounded-md flex items-center space-x-2">
                           <XCircleIcon />
                           <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-xl min-h-[300px] flex flex-col justify-center">
                   {mode === 'recognition' && (
                       recognizedStudent && lastSuccessfulCapture ? (
                            <div className="space-y-4 text-center animate-fade-in">
                                <img src={lastSuccessfulCapture.photo} alt={recognizedStudent.nome} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-indigo-500" />
                                <div>
                                    <h3 className="text-2xl font-bold">{recognizedStudent.nome}</h3>
                                    <p className="text-gray-400">{recognizedStudent.curso} - {recognizedStudent.turma}</p>
                                </div>
                                <div className={`text-lg font-semibold p-3 rounded-md bg-gray-700/50 ${EMOTION_COLORS[detectedEmotion]}`}>
                                    <span>Emoção: {EMOTION_EMOJIS[detectedEmotion]} {detectedEmotion}</span>
                                </div>
                                <div className="flex justify-center space-x-4 pt-4">
                                    <button onClick={() => handleLogAttendance('entrada')} disabled={isProcessing} className="btn-primary flex-grow disabled:opacity-50 text-lg">Entrada</button>
                                    <button onClick={() => handleLogAttendance('saida')} disabled={isProcessing} className="btn-secondary flex-grow disabled:opacity-50 text-lg">Saída</button>
                                </div>
                            </div>
                       ) : (
                            <div className="text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                <h3 className="mt-2 text-sm font-semibold text-gray-300">Aguardando Reconhecimento</h3>
                                <p className="mt-1 text-sm text-gray-500">Posicione o rosto em frente à câmera.</p>
                            </div>
                       )
                   )}
                   {mode === 'demonstration' && (
                       <div className="space-y-4 text-center animate-fade-in">
                           <div className="w-32 h-32 rounded-full mx-auto bg-gray-700 flex items-center justify-center border-4 border-purple-500">
                               <SparklesIcon className="w-16 h-16 text-purple-400" />
                           </div>
                            <div>
                               <h3 className="text-2xl font-bold">Visitante</h3>
                               <p className="text-gray-400">Análise de emoção em tempo real</p>
                           </div>
                           <div className={`text-xl font-semibold p-4 rounded-md bg-gray-700/50 ${EMOTION_COLORS[detectedEmotion]}`}>
                               {detectedEmotion === 'Analisando...' ? (
                                   <div className="flex items-center justify-center space-x-2">
                                       <div className="w-5 h-5 border-2 border-t-current border-gray-500 rounded-full animate-spin"></div>
                                       <span>Analisando Emoção...</span>
                                   </div>
                               ) : (
                                   <span>{EMOTION_EMOJIS[detectedEmotion]} {detectedEmotion}</span>
                               )}
                           </div>
                       </div>
                   )}
                </div>
            </div>
        </div>
    );
};

// Add helper styles for animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  .btn-primary {
    background-color: #4F46E5;
    color: white;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  .btn-primary:hover:not(:disabled) {
    background-color: #4338CA;
  }
  .btn-secondary {
    background-color: #374151;
    color: white;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  .btn-secondary:hover:not(:disabled) {
    background-color: #4B5563;
  }
`;
document.head.appendChild(styleSheet);


export default AttendanceCheck;