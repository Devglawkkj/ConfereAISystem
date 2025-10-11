
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { drawOnCanvasForPose } from '../utils/poseDrawingUtils';
import { XCircleIcon } from './icons/Icons';

const PoseDemonstrationPanel: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [statusMessage, setStatusMessage] = useState('Carregando modelo de pose...');
    const [error, setError] = useState('');

    const onResults = useCallback((results: any) => {
        const poseResults = results as PoseLandmarkerResult;
        const canvasCtx = canvasRef.current?.getContext('2d');

        if (canvasCtx && videoRef.current && videoRef.current.readyState >= 2) {
            drawOnCanvasForPose(canvasCtx, videoRef.current, poseResults);
            if (poseResults.landmarks && poseResults.landmarks.length > 0) {
                setStatusMessage('Pose corporal detectada!');
            } else {
                setStatusMessage('Aponte a câmera para uma pessoa');
            }
        }
    }, []);

    const { initialize, startWebcam, stopWebcam, isLoading, error: mediaPipeError } = useMediaPipe(onResults);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        
        const setup = async () => {
             await initialize('PoseLandmarker', {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`
            });
            if (videoElement && canvasElement) {
                const handleDataLoaded = () => {
                    canvasElement.width = videoElement.videoWidth;
                    canvasElement.height = videoElement.videoHeight;
                };
                videoElement.addEventListener('loadeddata', handleDataLoaded);

                await startWebcam(videoElement);
                setStatusMessage('Câmera iniciada. Procurando uma pessoa...');
            }
        }

        setup().catch(setError);

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('loadeddata', () => {});
            }
            stopWebcam();
        };
    }, [initialize, startWebcam, stopWebcam]);

    useEffect(() => {
        if (mediaPipeError) {
            setError(mediaPipeError);
            setStatusMessage('Erro ao iniciar a câmera.');
        }
    }, [mediaPipeError]);

    return (
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border-2 border-teal-500">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover hidden"></video>
                <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0"></canvas>
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-600 rounded-full animate-spin"></div>
                    </div>
                 )}
            </div>
            <p className="text-xl font-semibold text-center h-8" aria-live="polite">
                {isLoading ? 'Carregando modelo de IA...' : statusMessage}
            </p>
            {error && (
                <div className="bg-red-900/50 text-red-300 p-3 rounded-md flex items-center space-x-2">
                    <XCircleIcon />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default PoseDemonstrationPanel;
