import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import MattersPage from './pages/MattersPage';
import ProfilePage from './pages/ProfilePage';
import MatterWorkspace from './pages/workspace/MatterWorkspace';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/matters"
              element={
                <ProtectedRoute>
                  <MattersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Matter Workspace & Sub-Routes */}
            <Route
              path="/matters/:matterId"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matters/:matterId/documents"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matters/:matterId/research"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matters/:matterId/vulnerabilities"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matters/:matterId/clauses"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matters/:matterId/brief"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matters/:matterId/evidence"
              element={
                <ProtectedRoute>
                  <MatterWorkspace />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
