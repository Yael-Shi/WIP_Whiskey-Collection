import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import WrappedLayout from './components/common/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import TastingsPage from './pages/TastingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import DiscoverPage from './pages/DiscoverPage';
import TastingDetailPage from './pages/TastingDetailPage';
import WhiskeyDetailPage from './pages/WhiskeyDetailPage';

import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
    const { isAuthenticated, loadingAuth } = useAuth();

    if (loadingAuth) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <LoadingSpinner size="lg" message="טוען אפליקציה..." /> {/* הצג ספינר מרכזי */}
            </div>
        );
    }

    return (
        <div>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <WrappedLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="collection" element={<CollectionPage />} />
                    <Route path="collection/:id" element={<WhiskeyDetailPage />} />
                    <Route path="tastings" element={<TastingsPage />} />
                    <Route path="tastings/:id" element={<TastingDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
                <Route path="discover" element={<DiscoverPage />} />
            </Routes>
        </div>
    );
}

export default App;