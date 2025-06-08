import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ email, password, full_name: fullName });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'שגיאה בהרשמה. אנא נסה שוב.');
      console.error('Registration error:', err);
    }
    setLoading(false);
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-xl dark:bg-gray-800"
      dir="rtl"
    >
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <UserPlus className="w-12 h-12 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-2xl md:text-3xl">יצירת חשבון חדש</CardTitle>
        <CardDescription>הצטרף לקהילת חובבי הוויסקי שלנו.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-md border border-red-200 dark:border-red-700">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label
              htmlFor="fullName-register"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              שם מלא (אופציונלי)
            </label>
            <Input
              id="fullName-register"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ישראל ישראלי"
              autoComplete="name"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email-register"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              כתובת אימייל <span className="text-red-500">*</span>
            </label>
            <Input
              id="email-register"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password-register"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              סיסמה <span className="text-red-500">*</span>
            </label>
            <Input
              id="password-register"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="לפחות 8 תווים"
              required
              minLength="8" // todo: make sure server checks that
              autoComplete="new-password"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword-register"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              אימות סיסמה <span className="text-red-500">*</span>
            </label>
            <Input
              id="confirmPassword-register"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הקלד שוב את הסיסמה"
              required
              minLength="8"
              autoComplete="new-password"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" textColor="text-white" />
            ) : (
              'הירשם'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          כבר יש לך חשבון?{' '}
          <Link
            to="/login"
            className="font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            התחבר כאן
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
