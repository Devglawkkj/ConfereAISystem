import React, { useState } from 'react';
import Header from './components/Header';
import About from './components/About';
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import AttendanceCheck from './components/AttendanceCheck';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('about');

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <About />;
      case 'dashboard':
        return <Dashboard />;
      case 'register':
        return <StudentRegistration setCurrentPage={setCurrentPage} />;
      case 'attendance':
        return <AttendanceCheck />;
      default:
        return <About />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;