import React from 'react';
import { UserRole } from '../types';
import { ShieldCheckIcon, BookOpenIcon, ClipboardListIcon } from './icons/Icons';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const RoleCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; color: string; }> = 
({ icon, title, description, onClick, color }) => (
    <button 
        onClick={onClick}
        className={`bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 text-left w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 focus:outline-none focus:ring-2 ${color}`}
    >
        <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gray-700 p-4 rounded-full">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400">{description}</p>
    </button>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <header className="text-center mb-12">
          <svg className="mx-auto" width="270" height="51" viewBox="0 0 180 34" xmlns="http://www.w3.org/2000/svg">
              <style>
                {`.logo-text { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 30px; font-weight: 700; fill: #4c1d95; }`}
              </style>
              <text className="logo-text" x="0" y="28">C</text>
              <g transform="translate(26, 4)">
                {/* The eye */}
                <g stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M13 1 V 5" />
                  <path d="M13 25 V 21" />
                  <path d="M1 13 H 5" />
                  <path d="M25 13 H 21" />
                  <path d="M4.5 4.5 L 7.5 7.5" />
                  <path d="M21.5 4.5 L 18.5 7.5" />
                  <path d="M4.5 21.5 L 7.5 18.5" />
                  <path d="M21.5 21.5 L 18.5 18.5" />
                </g>
                <circle cx="13" cy="13" r="8" fill="#84cc16" />
                <circle cx="13" cy="13" r="4" fill="#4c1d95" />
              </g>
              <text className="logo-text" x="58" y="28">nfere AI.</text>
            </svg>
        <h1 className="text-4xl font-extrabold text-indigo-400 mt-4">
            Acesso ao Sistema
        </h1>
        <p className="text-lg text-gray-400 mt-2">Selecione seu perfil para continuar.</p>
      </header>
      
      <main className="flex flex-col md:flex-row gap-8">
        <RoleCard 
            icon={<ShieldCheckIcon className="w-8 h-8 text-indigo-400"/>} 
            title="Administrador"
            description="Acesso total ao sistema, incluindo cadastro de alunos, painéis de controle e configurações."
            onClick={() => onLogin('admin')}
            color="focus:ring-indigo-500"
        />
        <RoleCard 
            icon={<BookOpenIcon className="w-8 h-8 text-green-400"/>} 
            title="Professor"
            description="Acesse o dashboard da turma, registre presenças e acompanhe o engajamento dos alunos."
            onClick={() => onLogin('teacher')}
            color="focus:ring-green-500"
        />
        <RoleCard 
            icon={<ClipboardListIcon className="w-8 h-8 text-purple-400"/>} 
            title="Psicopedagogo"
            description="Visualize análises comportamentais, relatórios individuais e adicione observações."
            onClick={() => onLogin('therapist')}
            color="focus:ring-purple-500"
        />
      </main>
    </div>
  );
};

export default LoginScreen;