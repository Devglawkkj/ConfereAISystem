import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFirestore } from '../hooks/useFirestoreMock';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { calculateSimilarity } from '../utils/facialRecognition';
import { getFacialMetrics, analyzeEmotions } from '../services/geminiService';
import { Student, Emotion, AttendanceLog } from '../types';
import { FaceLandmarkerResult, Category } from '@mediapipe/tasks-vision';
import { SIMILARITY_THRESHOLD, EMOTION_SCORES } from '../constants';
import { XCircleIcon, UsersIcon, SparklesIcon, CpuChipIcon } from './icons/Icons';
import { drawOnCanvas, DrawStatus } from '../utils/drawingUtils';


type AttendanceMode = 'recognition' | 'face_demonstration';

const AttendanceCheck: React.FC = () => {
    const { students, addAttendanceLog } = useFirestore();
    const [mode, setMode] = useState<AttendanceMode>('recognition');
    const [statusMessage, setStatusMessage] = useState('Inicializando câmera...');
    const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [lastSuccessfulCapture, setLastSuccessfulCapture] = useState<{ photo: string; landmarks: any; blendshapes: any; } | null>(null);
    const [drawStatus, setDrawStatus] = useState<DrawStatus>('detecting');
    const [facialMetrics, setFacialMetrics] = useState<{ [key: string]: number } | null>(null);
    const [blendshapes, setBlendshapes] = useState<Category[] | null>(null);
    const [currentEmotion, setCurrentEmotion] = useState<Emotion>('Analisando...');
    const [isEmotionAnalysisEnabled, setIsEmotionAnalysisEnabled] = useState(true);


    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const recognitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const emotionAnalysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetState = useCallback(() => {
        setRecognizedStudent(null);
        setLastSuccessfulCapture(null);
        setFacialMetrics(null);
        setBlendshapes(null);
        setCurrentEmotion('Analisando...');
        if (mode === 'recognition') {
            setStatusMessage('Procurando rosto...');
            setDrawStatus('detecting');
        } else {
            setStatusMessage('Aponte a câmera para um rosto');
            setDrawStatus('demo');
        }
    }, [mode]);

    const onResults = useCallback(async (results: any) => {
        const faceResults = results as FaceLandmarkerResult;
        if (!faceResults) return;

        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx && videoRef.current && videoRef.current.readyState >= 2) {
            drawOnCanvas(canvasCtx, videoRef.current, faceResults, drawStatus);
        }

        if (isProcessing) return;

        if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
            const detectedLandmarks = faceResults.faceLandmarks[0];
            const detectedBlendshapes = faceResults.faceBlendshapes?.[0]?.categories;
            
            if (isEmotionAnalysisEnabled) {
                if (!emotionAnalysisTimeoutRef.current) {
                    setCurrentEmotion('Analisando...');
                    emotionAnalysisTimeoutRef.current = setTimeout(async () => {
                        const emotion = await analyzeEmotions(detectedLandmarks, detectedBlendshapes);
                        setCurrentEmotion(emotion);
                        emotionAnalysisTimeoutRef.current = null;
                    }, 2000);
                }
            } else {
                setCurrentEmotion('Neutro');
            }


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
                    
                    setLastSuccessfulCapture({ photo: photoDataUrl, landmarks: detectedLandmarks, blendshapes: detectedBlendshapes });

                } else {
                    setStatusMessage('Aluno não reconhecido. Tente novamente.');
                    setDrawStatus('unrecognized');
                    if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
                    recognitionTimeoutRef.current = setTimeout(() => {
                       if (!recognizedStudent) resetState();
                    }, 2000);
                }
            } else { // mode === 'face_demonstration'
                setStatusMessage('Analisando visitante...');
                setDrawStatus('demo');
                if(recognizedStudent) setRecognizedStudent(null);
                
                const metrics = getFacialMetrics(detectedLandmarks);
                setFacialMetrics(metrics);
                setBlendshapes(detectedBlendshapes || []);
            }
        } else {
            if (mode === 'recognition' && !recognizedStudent) {
                resetState();
            } else if (mode === 'face_demonstration') {
                setStatusMessage('Aponte a câmera para um rosto');
                setFacialMetrics(null);
                setBlendshapes(null);
            }
        }

    }, [students, isProcessing, recognizedStudent, resetState, mode, drawStatus, isEmotionAnalysisEnabled]);

    const { initialize, startWebcam, close, error: mediaPipeError } = useMediaPipe(onResults);
    
    useEffect(() => {
        resetState();
    }, [mode, resetState]);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        
        const handleDataLoaded = () => {
            if (videoElement && canvasElement) {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
            }
        };

        const setup = async () => {
             await initialize('FaceLandmarker', {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
            });
            if (videoElement && canvasElement) {
                videoElement.addEventListener('loadeddata', handleDataLoaded);

                await startWebcam(videoElement);
                setStatusMessage('Câmera iniciada. Procurando rosto...');
            }
        }

        setup();

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('loadeddata', handleDataLoaded);
            }
            close();
            if (recognitionTimeoutRef.current) clearTimeout(recognitionTimeoutRef.current);
            if (emotionAnalysisTimeoutRef.current) clearTimeout(emotionAnalysisTimeoutRef.current);
        };
    }, [initialize, startWebcam, close]);

    useEffect(() => {
        if (mediaPipeError) setError(mediaPipeError);
    }, [mediaPipeError]);


    const handleLogAttendance = async (type: 'entrada' | 'saida') => {
        if (!recognizedStudent || !lastSuccessfulCapture || isProcessing) {
            return;
        }

        setIsProcessing(true);
        setError('');
        
        const detectedEmotion = currentEmotion;
        const baseEngagement = 50;
        const emotionModifier = EMOTION_SCORES[detectedEmotion] || 0;
        let engagementIndex = baseEngagement + emotionModifier;
        engagementIndex = Math.max(0, Math.min(100, engagementIndex)); // Clamp between 0 and 100

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
              <button onClick={() => setMode('recognition')} className={`${mode === 'recognition' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'} px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2`}><UsersIcon className="w-5 h-5" /><span>Reconhecimento</span></button>
              <button onClick={() => setMode('face_demonstration')} className={`${mode === 'face_demonstration' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'} px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2`}><SparklesIcon className="w-5 h-5" /><span>Demo Facial</span></button>
          </div>
      </div>
    );
    
    const renderEmotionToggle = () => (
        <div className="flex justify-center items-center space-x-3 mb-4">
            <label htmlFor="emotion-toggle" className="text-sm font-medium text-gray-300">Análise de Emoção com IA</label>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    id="emotion-toggle"
                    checked={isEmotionAnalysisEnabled} 
                    onChange={() => setIsEmotionAnalysisEnabled(!isEmotionAnalysisEnabled)}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    );

    const interestingBlendshapes = ['mouthSmileLeft', 'mouthSmileRight', 'mouthFrownLeft', 'mouthFrownRight', 'jawOpen', 'eyeBlinkLeft', 'eyeBlinkRight', 'browDownLeft', 'browDownRight', 'browInnerUp'];
    const blendshapeTranslations: { [key: string]: string } = { mouthSmileLeft: 'Sorriso (Esquerdo)', mouthSmileRight: 'Sorriso (Direito)', mouthFrownLeft: 'Tristeza (Esquerdo)', mouthFrownRight: 'Tristeza (Direito)', jawOpen: 'Boca Aberta', eyeBlinkLeft: 'Piscar (Esquerdo)', eyeBlinkRight: 'Piscar (Direito)', browDownLeft: 'Sobrancelha Baixa (Esq.)', browDownRight: 'Sobrancelha Baixa (Dir.)', browInnerUp: 'Sobrancelha Erguida', };
    const filteredBlendshapes = blendshapes?.filter(b => interestingBlendshapes.includes(b.categoryName)).sort((a,b) => interestingBlendshapes.indexOf(a.categoryName) - interestingBlendshapes.indexOf(b.categoryName));


    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-indigo-400 mb-2 text-center">Registro de Ponto e Demonstrações</h2>
            {renderModeSwitcher()}
            {renderEmotionToggle()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover hidden"></video>
                        <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0"></canvas>
                        {isProcessing && ( <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div></div> )}
                    </div>
                     <p className="text-xl font-semibold text-center h-8" aria-live="polite">{statusMessage}</p>
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-3 rounded-md flex items-center space-x-2">
                            <XCircleIcon />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
                
                {mode === 'recognition' && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        {recognizedStudent ? (
                            <div className="text-center">
                                <img src={lastSuccessfulCapture?.photo} alt={recognizedStudent.nome} className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-green-500 object-cover"/>
                                <h3 className="text-2xl font-bold">{recognizedStudent.nome}</h3>
                                <p className="text-indigo-400">{recognizedStudent.curso} - {recognizedStudent.turma}</p>
                                <p className={`text-2xl font-bold mt-4 ${isEmotionAnalysisEnabled ? 'text-green-400' : 'text-gray-500'}`}>{currentEmotion}</p>

                                <div className="mt-6 flex justify-center space-x-4">
                                    <button onClick={() => handleLogAttendance('entrada')} disabled={isProcessing} className="px-6 py-3 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition">Registrar Entrada</button>
                                    <button onClick={() => handleLogAttendance('saida')} disabled={isProcessing} className="px-6 py-3 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition">Registrar Saída</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                                <UsersIcon className="w-24 h-24 mb-4 text-gray-600"/>
                                <h3 className="text-xl font-semibold">Aguardando Reconhecimento</h3>
                                <p>Posicione o rosto em frente à câmera.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {mode === 'face_demonstration' && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                         <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center space-x-2"><CpuChipIcon className="w-5 h-5"/><span>Métricas Faciais em Tempo Real</span></h3>
                         <div className="space-y-3">
                             {facialMetrics ? (
                                 Object.entries(facialMetrics).map(([key, value]) => (
                                     <div key={key}>
                                         <div className="flex justify-between items-baseline mb-1">
                                             <span className="text-sm font-medium text-gray-300">{key}</span>
                                             <span className="text-sm font-medium text-purple-300 font-mono">{Number(value).toFixed(3)}</span>
                                         </div>
                                         <div className="w-full bg-gray-700 rounded-full h-2">
                                             <div 
                                                className="bg-purple-500 h-2 rounded-full transition-all duration-200" 
                                                style={{ width: `${Math.min(100, Number(value) * (key.includes('Boca') ? 80 : 500))}%` }}>
                                             </div>
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                <p className="text-gray-500">Nenhuma métrica detectada.</p>
                             )}
                         </div>

                         <h3 className="text-xl font-semibold mt-6 mb-4 text-purple-400 flex items-center space-x-2"><SparklesIcon className="w-5 h-5"/><span>Microexpressões (Blendshapes)</span></h3>
                         <div className="space-y-3">
                             {filteredBlendshapes && filteredBlendshapes.length > 0 ? (
                                 filteredBlendshapes.map(b => (
                                     <div key={b.categoryName}>
                                         <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-sm font-medium text-gray-300">{blendshapeTranslations[b.categoryName] || b.categoryName}</span>
                                            <span className="text-sm font-medium text-purple-300 font-mono">{`${(b.score * 100).toFixed(0)}%`}</span>
                                         </div>
                                         <div className="w-full bg-gray-700 rounded-full h-2">
                                             <div 
                                                className="bg-purple-500 h-2 rounded-full transition-all duration-200" 
                                                style={{ width: `${b.score * 100}%` }}>
                                             </div>
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                <p className="text-gray-500">Nenhuma microexpressão detectada.</p>
                             )}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceCheck;