
import { useState, useRef, useCallback } from 'react';
import { VisionTaskRunner, FilesetResolver, FaceLandmarker, PoseLandmarker, FaceLandmarkerResult, PoseLandmarkerResult } from '@mediapipe/tasks-vision';

type Landmarker = FaceLandmarker | PoseLandmarker;
type LandmarkerResult = FaceLandmarkerResult | PoseLandmarkerResult;

export type MediaPipeTask = 'FaceLandmarker' | 'PoseLandmarker';

export interface MediaPipeOptions {
    modelAssetPath: string;
    delegate?: 'CPU' | 'GPU';
    numFaces?: number;
    numPoses?: number;
}

// A generic hook for MediaPipe vision tasks
export const useMediaPipe = (onResults: (results: LandmarkerResult) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const landmarkerRef = useRef<Landmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastResultRef = useRef<LandmarkerResult | null>(null);

  const initialize = useCallback(async (task: MediaPipeTask, options: MediaPipeOptions) => {
    setIsLoading(true);
    setError('');
    try {
        if (landmarkerRef.current) {
            await landmarkerRef.current.close();
            landmarkerRef.current = null;
        }

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
      );
      
      const baseOptions = {
        baseOptions: {
          modelAssetPath: options.modelAssetPath,
          delegate: options.delegate || 'GPU',
        },
        runningMode: 'VIDEO' as const,
      };

      if (task === 'FaceLandmarker') {
        landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
            ...baseOptions,
            outputFaceBlendshapes: true,
            numFaces: options.numFaces || 1,
        });
      } else if (task === 'PoseLandmarker') {
         landmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
            ...baseOptions,
            numPoses: options.numPoses || 1,
         });
      }

    } catch (e: any) {
      console.error(`Failed to initialize MediaPipe task ${task}:`, e);
      setError('Não foi possível carregar o modelo de IA. Verifique a conexão com a internet.');
    } finally {
        setIsLoading(false);
    }
  }, []);

  const predictWebcam = useCallback(() => {
    const landmarker = landmarkerRef.current;
    if (!videoRef.current || !landmarker || videoRef.current.paused || videoRef.current.ended) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }
    const startTimeMs = performance.now();
    const results = (landmarker as VisionTaskRunner).detectForVideo(videoRef.current, startTimeMs);
    if(results) {
        lastResultRef.current = results as LandmarkerResult;
        onResults(results as LandmarkerResult);
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [onResults]);

  const startWebcam = useCallback(async (videoElement: HTMLVideoElement) => {
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    videoRef.current = videoElement;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoElement.srcObject = stream;
        videoElement.addEventListener('loadeddata', predictWebcam);
    } catch (err: any) {
        console.error("getUserMedia error:", err);
        setError("Acesso à câmera negado. Por favor, habilite a permissão no seu navegador.");
        throw err;
    }
  }, [predictWebcam]);

  const stopWebcam = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      videoRef.current.removeEventListener('loadeddata', predictWebcam);
    }
  }, [predictWebcam]);
  
  const close = useCallback(async () => {
    stopWebcam();
    if(landmarkerRef.current) {
        await landmarkerRef.current.close();
        landmarkerRef.current = null;
    }
  }, [stopWebcam]);

  return { initialize, startWebcam, stopWebcam, close, isLoading, error, lastResult: lastResultRef.current };
};
