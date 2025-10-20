import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { HomeIcon, UserPlusIcon, CameraIcon, LayoutDashboardIcon, ShieldCheckIcon } from './icons/Icons';
import { useAuth } from '../contexts/AuthContext';

const roleNames: { [key in UserRole]: string } = {
  admin: 'Administrador',
  teacher: 'Professor',
  therapist: 'Psicopedagogo'
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

  const allNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon />, roles: ['admin', 'teacher', 'therapist'] as UserRole[] },
    { to: '/register', label: 'Cadastrar Aluno', icon: <UserPlusIcon />, roles: ['admin'] as UserRole[] },
    { to: '/attendance', label: 'Registrar Ponto', icon: <CameraIcon />, roles: ['admin', 'teacher'] as UserRole[] },
  ];

  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} aria-label="ConfereAI - Página Inicial" className="flex items-center">
            <svg width="180" height="34" viewBox="0 0 180 34" xmlns="http://www.w3.org/2000/svg">
              <style>
                {`.logo-text { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 30px; font-weight: 700; fill: #4c1d95; }`}
              </style>
              <text className="logo-text" x="0" y="28">C</text>
              <g transform="translate(26, 4)">
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
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 mr-4 border-r border-gray-600 pr-4">
            <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium text-gray-300">{userRole ? roleNames[userRole] : ''}</span>
          </div>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-indigo-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="text-gray-300 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            aria-label="Sair do sistema"
          >
            <span className="hidden sm:inline">Sair</span>
            <svg className="w-5 h-5 inline sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
