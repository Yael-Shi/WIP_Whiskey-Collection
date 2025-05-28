import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ודא שהנתיב נכון

import { Button } from '../components/ui/button';

// ייבוא אייקונים (אופציונלי)
import { Wine, LogIn, UserPlus, Compass } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();

  // אם המשתמש כבר מאומת, נתב אותו לדשבורד
  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loadingAuth, navigate]);

  // אם עדיין בודקים אימות, אפשר להציג משהו מינימלי או כלום
  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        {/* <LoadingSpinner size="lg" message="טוען..." />  אם יש לך קומפוננטת טעינה */}
        <p>טוען...</p>
      </div>
    );
  }

  // אם המשתמש מאומת, ה-useEffect למעלה כבר ינתב אותו,
  // אז לא נגיע לכאן. רק במקרה שה-useEffect עוד לא הספיק, אפשר להחזיר null.
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-800 dark:text-gray-100" dir="rtl">
      <header className="mb-12">
        <Wine className="w-24 h-24 md:w-32 md:h-32 text-amber-500 dark:text-amber-400 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-amber-800 dark:text-amber-200">
          ברוכים הבאים לאוסף הוויסקי
        </h1>
        <p className="text-lg md:text-xl text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
          גלו, תעדו ונהלו את אוסף הוויסקי האישי שלכם. התחברו כדי להתחיל במסע טעמים מרתק!
        </p>
      </header>

      <main className="space-y-6">
        <p className="text-md text-gray-600 dark:text-gray-400">
          כבר יש לכם חשבון? מעולה!
        </p>
        <Link to="/login">
          <Button 
            variant="default" 
            size="lg" 
            className="w-full sm:w-auto px-8 py-3 text-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white shadow-lg transform hover:scale-105 transition-transform"
          >
            <LogIn className="ml-2 rtl:mr-2 h-5 w-5" />
            התחברות
          </Button>
        </Link>

        <div className="my-6 text-center">
          <span className="text-gray-500 dark:text-gray-400">או</span>
        </div>

        <p className="text-md text-gray-600 dark:text-gray-400">
          חדשים כאן? הצטרפו לקהילה!
        </p>
        <Link to="/register">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto px-8 py-3 text-lg border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-300 dark:hover:bg-amber-900/50 shadow-lg transform hover:scale-105 transition-transform"
          >
            <UserPlus className="ml-2 rtl:mr-2 h-5 w-5" />
            הרשמה
          </Button>
        </Link>
      </main>

      <footer className="mt-16">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          מופעל על ידי אהבת הוויסקי (וקצת קוד).
        </p>
        {/* אפשר להוסיף קישור לדף "גילוי" גם למשתמשים לא מחוברים אם יש תוכן ציבורי */}
        {/* 
        <Link to="/discover" className="mt-4 inline-flex items-center text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
          <Compass className="ml-1 rtl:mr-1 h-4 w-4" />
          גלה המלצות וויסקי
        </Link>
        */}
      </footer>
    </div>
  );
}