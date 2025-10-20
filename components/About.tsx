import React from 'react';
import { CpuChipIcon, FaceSmileIcon, ShieldCheckIcon, SparklesIcon, UserPlusIcon, CameraIcon, LayoutDashboardIcon, BrainIcon, ClipboardListIcon } from './icons/Icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center space-x-4 mb-3">
            <div className="bg-indigo-500 p-3 rounded-full">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 flex-grow">
            {children}
        </p>
    </div>
);

const StepCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex items-start space-x-4">
        <div className="bg-gray-700 p-3 rounded-full text-indigo-400">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-lg text-white">{title}</h4>
            <p className="text-gray-400 text-sm">{children}</p>
        </div>
    </div>
);


const About: React.FC = () => {
  return (
    <div className="space-y-16">
        <section className="text-center bg-gray-800/50 p-10 rounded-xl shadow-2xl border border-gray-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-4">
                Bem-vindo ao ConfereAI
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-300">
                Revolucionando a gestão educacional com biometria facial e análise de engajamento em tempo real. Uma solução inteligente para um ambiente de aprendizado mais seguro e perspicaz.
            </p>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-indigo-400">Funcionalidades Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard icon={<ShieldCheckIcon className="w-6 h-6 text-white"/>} title="Biometria Facial">
                    Registro de entrada e saída rápido e à prova de fraudes, garantindo a segurança dos alunos e a precisão dos registros de presença.
                </FeatureCard>
                <FeatureCard icon={<FaceSmileIcon className="w-6 h-6 text-white"/>} title="Análise de Emoções">
                    Nossa IA analisa expressões faciais para identificar emoções, fornecendo insights valiosos sobre o engajamento e a saúde mental da turma.
                </FeatureCard>
                <FeatureCard icon={<SparklesIcon className="w-6 h-6 text-white"/>} title="Insights com Gemini AI">
                    A IA do Google Gemini gera relatórios e análises preditivas, ajudando educadores a identificar padrões e a apoiar os alunos de forma proativa.
                </FeatureCard>
                <FeatureCard icon={<ClipboardListIcon className="w-6 h-6 text-white"/>} title="Visão 360º do Aluno">
                    Visualize um perfil completo do aluno, cruzando dados de presença, emoções, notas e observações psicopedagógicas em um só lugar.
                </FeatureCard>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-indigo-400">Como Funciona?</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <StepCard icon={<UserPlusIcon />} title="1. Cadastro Rápido">
                    Cadastre alunos em segundos com a captura de biometria facial, criando um perfil seguro e único para cada um.
                </StepCard>
                 <StepCard icon={<CameraIcon />} title="2. Registro de Ponto Inteligente">
                    Alunos registram presença apenas olhando para a câmera. O sistema reconhece e analisa a emoção em tempo real.
                </StepCard>
                 <StepCard icon={<LayoutDashboardIcon />} title="3. Dashboard Centralizado">
                    Educadores acessam um dashboard com dados em tempo real, filtros por turma e gráficos de engajamento por disciplina.
                </StepCard>
                 <StepCard icon={<BrainIcon className="w-5 h-5" />} title="4. Análise Holística com IA">
                    Gere relatórios completos que cruzam todos os dados do aluno, fornecendo insights profundos e recomendações acionáveis.
                </StepCard>
            </div>
        </section>

        <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-indigo-400">Para Quem é o ConfereAI?</h2>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-xl mb-2 text-white">Educadores e Coordenadores</h4>
                    <p className="text-gray-400">Para acompanhar o engajamento da turma de perto e identificar alunos que precisam de apoio. </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-xl mb-2 text-white">Instituições de Ensino</h4>
                    <p className="text-gray-400">Para modernizar a gestão de presença, aumentar a segurança e obter dados estratégicos.</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-xl mb-2 text-white">Psicólogos e Terapeutas</h4>
                    <p className="text-gray-400">Para complementar o acompanhamento com dados objetivos sobre o estado emocional dos alunos.</p>
                </div>
            </div>
        </section>

        <section className="bg-gray-800 p-8 rounded-lg shadow-xl">
             <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">Tecnologia de Ponta</h2>
             <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center">
                <div className="flex flex-col items-center">
                    <CpuChipIcon className="w-12 h-12 text-indigo-400 mb-2"/>
                    <h3 className="text-xl font-semibold">MediaPipe</h3>
                    <p className="text-gray-400">Para detecção facial e extração de <br/> pontos de referência em tempo real.</p>
                </div>
                 <div className="text-4xl text-gray-600">+</div>
                 <div className="flex flex-col items-center">
                    <SparklesIcon className="w-12 h-12 text-indigo-400 mb-2"/>
                    <h3 className="text-xl font-semibold">Google Gemini</h3>
                    <p className="text-gray-400">Para análise de emoções, geração de <br/> relatórios e insights complexos.</p>
                </div>
             </div>
        </section>
    </div>
  );
};


export default About;