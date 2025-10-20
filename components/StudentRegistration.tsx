import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFirestore } from '../hooks/useFirestoreMock';
import { Student } from '../types';
import { useNavigate } from 'react-router-dom';
import { NormalizedLandmark, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { CameraIcon, CheckCircleIcon } from './icons/Icons';


const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addStudent } = useFirestore();
  const [formData, setFormData] = useState({ nome: '', cpf: '', ra: '', turma: '', curso: '', email: '' });
  const [biometrics, setBiometrics] = useState<NormalizedLandmark[] | null>(null);
  const [photo, setPhoto] = useState<string>(''); // photo is a data URL
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onResults = useCallback((results: any) => {
    const faceResults = results as FaceLandmarkerResult;
    if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
       if (canvasRef.current && videoRef.current) {
        const canvasCtx = canvasRef.current.getContext('2d');
        if (canvasCtx) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.restore();
        }
      }
    }
  }, []);

  const { initialize, startWebcam, stopWebcam, lastResult, error: mediaPipeError } = useMediaPipe(onResults);

  useEffect(() => {
    return () => { stopWebcam(); };
  }, [stopWebcam]);

  useEffect(() => {
    if (mediaPipeError) {
        setError(mediaPipeError);
        setIsCapturing(false);
    }
  }, [mediaPipeError]);

  const handleStartCapture = async () => {
    setError('');
    setBiometrics(null);
    setPhoto('');
    setSuccess('');
    setIsCapturing(true);
     await initialize('FaceLandmarker', {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
    });
    if (videoRef.current) {
        await startWebcam(videoRef.current);
    }
  };
  
  const handleCaptureBiometrics = () => {
      const faceResult = lastResult as FaceLandmarkerResult;
      if (faceResult?.faceLandmarks && faceResult.faceLandmarks.length > 0) {
        const landmarks = faceResult.faceLandmarks[0];
        setBiometrics(landmarks);

        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setPhoto(canvas.toDataURL('image/jpeg'));
            }
        }
        
        setSuccess('Biometria e foto capturadas com sucesso!');
        setIsCapturing(false);
        stopWebcam();
      } else {
        setError('Nenhum rosto detectado. Tente novamente.');
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biometrics || !photo) {
      setError('Por favor, capture a biometria facial antes de cadastrar.');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
        const newStudent: Omit<Student, 'id' | 'dataCadastro' | 'historicoDeNotas'> = {
            ...formData,
            biometriaFacial: biometrics,
            urlFoto: photo, // Pass the data URL to the hook
        };
        await addStudent(newStudent);
        setSuccess('Aluno cadastrado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
        console.error("Error adding student:", err);
        setError(err.message || "Ocorreu um erro ao cadastrar o aluno.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6">Cadastro de Aluno</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="nome" placeholder="Nome Completo" onChange={handleChange} required className="bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="cpf" placeholder="CPF" onChange={handleChange} required className="bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="ra" placeholder="RA (Registro Acadêmico)" onChange={handleChange} required className="bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="turma" placeholder="Turma" onChange={handleChange} required className="bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="curso" placeholder="Curso" onChange={handleChange} required className="bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required className="bg-gray-800 border border-gray-700 text-gray-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="md:col-span-2 flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-md h-64 bg-gray-900 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCapturing && 'hidden'}`}></video>
                <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0"></canvas>
                {!isCapturing && photo && <img src={photo} alt="Captured face" className="w-full h-full object-cover" />}
                 {!isCapturing && !photo && (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <CameraIcon className="w-16 h-16"/>
                    </div>
                )}
            </div>
            
            {!isCapturing && !biometrics && (
                <button type="button" onClick={handleStartCapture} className="bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 transition flex items-center space-x-2"><CameraIcon/><span>Iniciar Captura Facial</span></button>
            )}
            {isCapturing && (
                 <button type="button" onClick={handleCaptureBiometrics} className="bg-gray-700 text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-600 transition">Capturar Biometria</button>
            )}

            {biometrics && (
                <div className="text-green-400 flex items-center space-x-2"><CheckCircleIcon /><span>Biometria Capturada!</span></div>
            )}
        </div>

        {error && <p className="text-red-400 md:col-span-2 text-center bg-red-900/30 p-3 rounded-md">{error}</p>}
        {success && <p className="text-green-400 md:col-span-2 text-center">{success}</p>}

        <div className="md:col-span-2">
          <button type="submit" disabled={!biometrics || isSubmitting} className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
          </button>
        </div>
      </form>
    </div>
  );
};



export default StudentRegistration;