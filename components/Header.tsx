import React from 'react';
import { Page } from '../types';
import { HomeIcon, UserPlusIcon, CameraIcon, LayoutDashboardIcon } from './icons/Icons';

interface HeaderProps {
  setCurrentPage: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage, currentPage }) => {
  const navItems = [
    { page: 'about' as Page, label: 'Início', icon: <HomeIcon /> },
    { page: 'dashboard' as Page, label: 'Dashboard', icon: <LayoutDashboardIcon /> },
    { page: 'register' as Page, label: 'Cadastrar Aluno', icon: <UserPlusIcon /> },
    { page: 'attendance' as Page, label: 'Registrar Ponto', icon: <CameraIcon /> },
  ];

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">
           <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }} aria-label="ConfereAI - Página Inicial" className="flex items-center">
            <svg width="180" height="34" viewBox="0 0 180 34" xmlns="http://www.w3.org/2000/svg">
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
           </a>
        </h1>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map(({ page, label, icon }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentPage === page
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;