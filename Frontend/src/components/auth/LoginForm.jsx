import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { LogIn } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות. אנא בדוק את פרטיך ונסה שוב.');
      console.error("Login error:", err);
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl dark:bg-gray-800" dir="rtl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <LogIn className="w-12 h-12 text-amber-600 dark:text-amber-400"/>
        </div>
        <CardTitle className="text-2xl md:text-3xl">התחברות לחשבון</CardTitle>
        <CardDescription>הזן את פרטיך כדי להמשיך לאוסף הוויסקי שלך.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-md border border-red-200 dark:border-red-700">{error}</p>}
          <div className="space-y-2">
            <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              כתובת אימייל
            </label>
            <Input
              id="email-login"
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
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              סיסמה
            </label>
            <Input
              id="password-login"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" textColor="text-white"/> : 'התחבר'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-3 pt-4">
        {/* <Link to="/forgot-password"
            className="text-sm text-amber-600 hover:underline dark:text-amber-400">
            שכחת סיסמה?
        </Link> */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          אין לך חשבון?{' '}
          <Link to="/register" className="font-medium text-amber-600 hover:underline dark:text-amber-400">
            הירשם כאן
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}