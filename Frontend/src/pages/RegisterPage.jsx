import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ודא שהנתיב נכון

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ייבוא אייקונים (אופציונלי)
import { UserPlus, Mail, Lock, AlertCircle, User, Wine } from 'lucide-react';

// דמה של פונקציית הרשמה - החלף בקריאת API אמיתית
const registerUserApi = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // הדמיית בדיקה אם המייל כבר קיים
      if (userData.email === "taken@example.com") {
        reject(new Error("כתובת אימייל זו כבר רשומה במערכת."));
        return;
      }
      // הדמיית הרשמה מוצלחת
      const newUser = {
        id: Math.random().toString(36).substring(7),
        fullName: userData.fullName,
        email: userData.email,
        // כאן יכולים להיות עוד פרטים המוחזרים מהשרת
      };
      console.log("User registered (mock):", newUser);
      resolve(newUser);
    }, 1500);
  });
};


export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loadingAuth, login } = useAuth(); // אנו נשתמש ב-login כדי להכניס את המשתמש לאחר הרשמה מוצלחת

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  // אם המשתמש כבר מאומת, נתב אותו לדשבורד
  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    if (!fullName || !email || !password || !confirmPassword) {
      setError('אנא מלא את כל השדות.');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 1. קריאה ל-API להרשמת המשתמש
      const registeredUserData = await registerUserApi({ fullName, email, password });
      
      // 2. (אופציונלי) אם ההרשמה הצליחה, הצג הודעת הצלחה
      setSuccessMessage(`ההרשמה הצליחה! ברוך הבא, ${registeredUserData.fullName}. מעביר אותך להתחברות...`);

      // 3. (אופציונלי) התחבר אוטומטית למשתמש החדש
      //    או נתב אותו לדף ההתחברות כדי שיתחבר ידנית.
      //    כאן נדגים התחברות אוטומטית (אם ה-API שלך לא מחזיר טוקן בהרשמה, תצטרך להשתמש בנתוני ההרשמה).
      
      // נחכה קצת כדי שהמשתמש יראה את הודעת ההצלחה
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ננסה להתחבר עם הפרטים שהוזנו בהרשמה
      // ב-AuthContext הדמה שלנו, זה אמור לעבוד.
      // במערכת אמיתית, פונקציית login תקבל טוקן מהשרת.
      await login({ email, password }); // login מה-AuthContext שלך
      
      // ה-useEffect למעלה כבר אמור לטפל בניווט לדשבורד לאחר ש-isAuthenticated יהפוך ל-true
      // navigate('/dashboard'); // אפשר גם לנתב מכאן ישירות אם רוצים

    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || 'ההרשמה נכשלה. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // אם האימות עדיין בטעינה ואין אימות, הצג מחוון טעינה
  if (loadingAuth && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        <LoadingSpinner size="lg" message="טוען..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8 text-amber-600 dark:text-amber-400">
          <Wine className="h-12 w-12" />
        </Link>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
            יצירת חשבון חדש
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-600 dark:text-red-300 flex items-center">
              <AlertCircle size={18} className="ml-2 rtl:mr-2 rtl:ml-0 flex-shrink-0"/>
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
             <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 rounded-md text-sm text-green-700 dark:text-green-300">
                {successMessage}
            </div>
          )}

          {!successMessage && ( // הצג את הטופס רק אם אין הודעת הצלחה
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  שם מלא
                </label>
                 <div className="relative">
                    <User className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="השם שלך"
                    disabled={isSubmitting}
                    />
                </div>
              </div>

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
                    placeholder="לפחות 6 תווים"
                    disabled={isSubmitting}
                    />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  אימות סיסמה
                </label>
                 <div className="relative">
                    <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="הקלד שוב את הסיסמה"
                    disabled={isSubmitting}
                    />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full py-2.5 text-base bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="ml-2 rtl:mr-2" textColor="text-white"/>
                  ) : (
                    <UserPlus className="ml-2 rtl:mr-2 h-5 w-5" />
                  )}
                  {isSubmitting ? 'מעבד הרשמה...' : 'צור חשבון'}
                </Button>
              </div>
            </form>
          )}

          {!successMessage && (
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              כבר יש לך חשבון?{' '}
              <Link
                to="/login"
                className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                התחבר כאן
              </Link>
            </p>
          )}
           {successMessage && (
             <div className="mt-6 text-center">
                <Link to="/login">
                    <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        עבור לדף התחברות
                    </Button>
                </Link>
             </div>
           )}
        </div>
         <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            על ידי יצירת חשבון, אתה מסכים ל<Link to="/terms" className="underline hover:text-amber-600">תנאי השימוש</Link> ול<Link to="/privacy" className="underline hover:text-amber-600">מדיניות הפרטיות</Link> שלנו.
        </p>
      </div>
    </div>
  );
}
