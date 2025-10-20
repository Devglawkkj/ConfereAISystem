import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentRegistration from './components/StudentRegistration';
import AttendanceCheck from './components/AttendanceCheck';
import LoginScreen from './components/LoginScreen';
import About from './components/About';
import { useAuth } from './contexts/AuthContext';
import { RequireAuth, RequireRole } from './router/protected';

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {isLoggedIn && <Header />}
      <main className="p-4">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route
            path="/register"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={["admin"]}>
                  <StudentRegistration />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route path="/attendance" element={<RequireAuth><AttendanceCheck /></RequireAuth>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
