import React, { useState } from 'react';
import Header from './components/Header';
import About from './components/About';
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import AttendanceCheck from './components/AttendanceCheck';
import LoginScreen from './components/LoginScreen';
import { Page, UserRole } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('about');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Default page after login based on role
    if (role === 'admin' || role === 'teacher' || role === 'therapist') {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsLoggedIn(false);
    setCurrentPage('about');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <About />;
      case 'dashboard':
        return <Dashboard />;
      case 'register':
        // Only admin can register students
        return userRole === 'admin' ? <StudentRegistration setCurrentPage={setCurrentPage} /> : <Dashboard />;
      case 'attendance':
        return <AttendanceCheck />;
      default:
        return <About />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header 
        setCurrentPage={setCurrentPage} 
        currentPage={currentPage} 
        userRole={userRole}
        handleLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
