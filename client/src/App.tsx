
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import pages
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import VoiceAgents from '@/pages/VoiceAgents';
import Assistants from '@/pages/Assistants';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          }>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/voice-agents" element={
                <ProtectedRoute>
                  <VoiceAgents />
                </ProtectedRoute>
              } />
              
              <Route path="/assistants" element={
                <ProtectedRoute>
                  <Assistants />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </AppLayout>
      </AuthProvider>
    </Router>
  );
};

export default App;
