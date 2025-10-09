
import { useState, useRef, useCallback, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;

export const useMediaPipe = (onResults: (results: FaceLandmarkerResult) => void) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastResultRef = useRef<FaceLandmarkerResult | null>(null);

  const initializeMediaPipe = useCallback(async () => {
    try {
      if (faceLandmarker) {
        setIsLoading(false);
        return;
      }
      
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      setIsLoading(false);
    } catch (e: any) {
      console.error('Failed to initialize MediaPipe:', e);
      setError('Não foi possível carregar o modelo de IA. Verifique a conexão com a internet.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeMediaPipe();
  }, [initializeMediaPipe]);

  const predictWebcam = useCallback(() => {
    if (!videoRef.current || !faceLandmarker || videoRef.current.paused || videoRef.current.ended) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }
    const startTimeMs = performance.now();
    const results = faceLandmarker.detectForVideo(videoRef.current, startTimeMs);
    lastResultRef.current = results;
    onResults(results);

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [onResults]);

  const startWebcam = useCallback(async (videoElement: HTMLVideoElement) => {
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }

    videoRef.current = videoElement;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoElement.srcObject = stream;
        videoElement.addEventListener('loadeddata', predictWebcam);
    } catch (err: any) {
        console.error("getUserMedia error:", err);
        setError("Acesso à câmera negado. Por favor, habilite a permissão no seu navegador.");
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
    }
  }, []);

  return { startWebcam, stopWebcam, isLoading, error, lastResult: lastResultRef.current };
};
