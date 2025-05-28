import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout'; 

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
// ... עוד דפים

import { AuthProvider } from './contexts/AuthContext'; // ייבוא ה-AuthProvider

function App() {
  return (
    // תחילת שינוי: ה-Router עוטף את ה-AuthProvider
    <Router>
      <AuthProvider> {/* ה-AuthProvider עכשיו בתוך ה-Router */}
        <Layout> 
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* ... other public routes */}

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/collection" 
              element={
                <ProtectedRoute>
                  <CollectionPage />
                </ProtectedRoute>
              } 
            />
            {/* דוגמה לנתיב עם הגבלת תפקיד */}
            <Route 
              path="/admin-only" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {/* <AdminPage /> */}
                  <div>דף לאדמינים בלבד</div>
                </ProtectedRoute>
              } 
            />
            {/* ... other protected routes */}

            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </Layout>
      </AuthProvider> {/* סוף ה-AuthProvider */}
    </Router> // סוף השינוי: ה-Router סוגר
  );
}

export default App;