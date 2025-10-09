

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFirestoreMock } from '../hooks/useFirestoreMock';
import { Page, Student } from '../types';
import { NormalizedLandmark, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { CameraIcon, CheckCircleIcon } from './icons/Icons';

interface StudentRegistrationProps {
  setCurrentPage: (page: Page) => void;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ setCurrentPage }) => {
  const { addStudent } = useFirestoreMock();
  const [formData, setFormData] = useState({ nome: '', cpf: '', ra: '', turma: '', curso: '', email: '' });
  const [biometrics, setBiometrics] = useState<NormalizedLandmark[] | null>(null);
  const [photo, setPhoto] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onResults = useCallback((results: FaceLandmarkerResult) => {
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
       if (canvasRef.current && videoRef.current) {
        const canvasCtx = canvasRef.current.getContext('2d');
        if (canvasCtx) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          // Draw video frame
          canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          // Draw landmarks
          results.faceLandmarks.forEach(landmarks => {
            // Placeholder for drawing if needed, for now just use the data
          });
          canvasCtx.restore();
        }
      }
    }
  }, []);

  const { startWebcam, stopWebcam, lastResult } = useMediaPipe(onResults);

  useEffect(() => {
      return () => stopWebcam();
  }, [stopWebcam]);

  const handleStartCapture = async () => {
    setError('');
    setBiometrics(null);
    setPhoto('');
    setSuccess('');
    setIsCapturing(true);
    await startWebcam(videoRef.current!);
  };
  
  const handleCaptureBiometrics = () => {
      if (lastResult?.faceLandmarks && lastResult.faceLandmarks.length > 0) {
        const landmarks = lastResult.faceLandmarks[0];
        setBiometrics(landmarks);

        if (videoRef.current && canvasRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setPhoto(canvas.toDataURL('image/jpeg'));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biometrics || !photo) {
      setError('Por favor, capture a biometria facial antes de cadastrar.');
      return;
    }
    const newStudent: Omit<Student, 'id' | 'dataCadastro' | 'historicoDeNotas' | 'observacoesTerapeuta'> = {
      ...formData,
      biometriaFacial: biometrics,
      urlFoto: photo,
    };
    addStudent(newStudent);
    setSuccess('Aluno cadastrado com sucesso! Redirecionando...');
    setTimeout(() => setCurrentPage('dashboard'), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-indigo-400 mb-6">Cadastro de Aluno</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="nome" placeholder="Nome Completo" onChange={handleChange} required className="input-style" />
          <input type="text" name="cpf" placeholder="CPF" onChange={handleChange} required className="input-style" />
          <input type="text" name="ra" placeholder="RA (Registro Acadêmico)" onChange={handleChange} required className="input-style" />
          <input type="text" name="turma" placeholder="Turma" onChange={handleChange} required className="input-style" />
          <input type="text" name="curso" placeholder="Curso" onChange={handleChange} required className="input-style" />
          <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required className="input-style" />
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
                <button type="button" onClick={handleStartCapture} className="btn-primary flex items-center space-x-2"><CameraIcon/><span>Iniciar Captura Facial</span></button>
            )}
            {isCapturing && (
                 <button type="button" onClick={handleCaptureBiometrics} className="btn-secondary">Capturar Biometria</button>
            )}

            {biometrics && (
                <div className="text-green-400 flex items-center space-x-2"><CheckCircleIcon /><span>Biometria Capturada!</span></div>
            )}
        </div>

        {error && <p className="text-red-400 md:col-span-2 text-center">{error}</p>}
        {success && <p className="text-green-400 md:col-span-2 text-center">{success}</p>}

        <div className="md:col-span-2">
          <button type="submit" disabled={!biometrics} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Cadastrar Aluno
          </button>
        </div>
      </form>
    </div>
  );
};

// Add a helper style class definition in a global scope if not already present.
const globalStyles = `
  .input-style {
    background-color: #1F2937;
    border: 1px solid #4B5563;
    color: #F9FAFB;
    padding: 0.75rem;
    border-radius: 0.375rem;
    width: 100%;
  }
  .input-style:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  }
  .btn-primary {
    background-color: #4F46E5;
    color: white;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  .btn-primary:hover {
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
  .btn-secondary:hover {
    background-color: #4B5563;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);


export default StudentRegistration;