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
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          <h1 className="text-xl font-bold text-white">ConfereAI</h1>
        </div>
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