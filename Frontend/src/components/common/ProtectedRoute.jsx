import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    // הצג מחוון טעינה בזמן בדיקת מצב האימות
    return (
      <div className="flex justify-center items-center h-screen" dir="rtl">
        <LoadingSpinner size="lg" message="טוען..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // אם המשתמש לא מאומת, נתב אותו לדף ההתחברות
    // שמור את המיקום הנוכחי כדי שנוכל לחזור אליו לאחר ההתחברות
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // אם הנתיב דורש תפקידים מסוימים והמשתמש לא עומד בדרישות
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role; // נניח שיש שדה 'role' באובייקט המשתמש
    if (!userRole || !allowedRoles.includes(userRole)) {
      // אם למשתמש אין את התפקיד הנדרש, נתב אותו לדף שגיאה או לדף הבית
      // לדוגמה, לדף 403 (Forbidden) או חזרה לדשבורד
      console.warn(
        `User with role '${userRole}' tried to access a route requiring one of roles: ${allowedRoles.join(', ')}`,
      );
      return (
        <Navigate
          to="/dashboard"
          state={{ error: 'אין לך הרשאה לגשת לדף זה.' }}
          replace
        />
      );
      // אפשר גם להציג קומפוננטת שגיאה כאן במקום ניתוב
      // return <div className="text-center p-8"><h1>אין לך הרשאה לגשת לדף זה.</h1></div>;
    }
  }

  return children;
};

export default ProtectedRoute;
