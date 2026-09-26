import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Exams from './pages/Exams';
import Profile from './pages/Profile';
import Planner from './pages/Planner';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Support from './pages/Support';
import DocumentExam from './pages/DocumentExam';
import ErrorBoundary from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <CookieBanner />
      <Router>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Layout><Chat /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/exams" 
          element={
            <ProtectedRoute>
              <Layout><Exams /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/document-exam" 
          element={
            <ProtectedRoute>
              <Layout><DocumentExam /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/planner" 
          element={
            <ProtectedRoute>
              <Layout><Planner /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <Layout><Subscription /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/support" 
          element={
            <ProtectedRoute>
              <Layout><Support /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout><Admin /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
};

export default App;
