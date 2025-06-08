import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { LogIn, Mail, Lock, AlertCircle, Wine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loadingAuth, authError, clearAuthError } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    clearAuthError?.();
    return () => {
      clearAuthError?.();
    };
  }, [clearAuthError]);

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setPageError('אנא מלא את כל השדות.');
      setIsSubmitting(false);
      return;
    }

    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth && !isAuthenticated) {
    return (
      <div
        className="flex justify-center items-center min-h-[calc(100vh-200px)]"
        dir="rtl"
      >
        <LoadingSpinner size="lg" message="טוען..." />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex justify-center mb-8 text-amber-600 dark:text-amber-400"
        >
          <Wine className="h-12 w-12" />
        </Link>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
            התחברות לחשבון
          </h1>

          {(pageError || authError) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-600 dark:text-red-300 flex items-center">
              <AlertCircle
                size={18}
                className="ml-2 rtl:mr-2 rtl:ml-0 flex-shrink-0"
              />
              <span>{pageError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                כתובת אימייל
              </label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 rtl:pr-10 rtl:pl-3 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 rtl:pr-10 rtl:pl-3 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="********"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'מתחבר...' : 'התחבר'}
              <LogIn className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            אין לך חשבון?{' '}
            <Link
              to="/register"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              הרשם עכשיו
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
