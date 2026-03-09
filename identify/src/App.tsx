import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; 
import StudentRegistration from './pages/StudentRegistration';
import GlobalInactivityTimer from './components/GlobalInactivityTimer'; // <-- 1. ADD THIS IMPORT
import StudentMarks from './pages/StudentMarks';
import Analyse from './pages/Analyse';


const App: React.FC = () => {
  return (
    <Router>
      <Navbar /> 
      <GlobalInactivityTimer /> 
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/register-student" 
          element={
            <ProtectedRoute>
              <StudentRegistration />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/add-marks" 
          element={
            <ProtectedRoute>
              <StudentMarks />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analyse" 
          element={
            <ProtectedRoute>
              <Analyse />
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;