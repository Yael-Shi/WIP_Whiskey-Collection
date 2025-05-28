import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // לשימוש פוטנציאלי בניתוב לאחר התחברות/התנתקות
// import api from '../services/api'; // ייבוא של שירות ה-API שלך אם יש צורך בקריאות שרת לאימות

// יצירת הקונטקסט
const AuthContext = createContext(null);

// Hook מותאם אישית לשימוש בקונטקסט האימות
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ספק הקונטקסט
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // אובייקט המשתמש המאומת, או null
  const [loadingAuth, setLoadingAuth] = useState(true); // האם האימות הראשוני עדיין בטעינה
  const [authError, setAuthError] = useState(null); // שגיאות אימות
  const navigate = useNavigate();

  // פונקציה לבדיקת אימות ראשונית (לדוגמה, אם יש טוקן שמור ב-localStorage)
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoadingAuth(true);
      setAuthError(null);
      try {
        // כאן תהיה הלוגיקה לבדיקת טוקן מול השרת או localStorage
        // לדוגמה:
        const token = localStorage.getItem('authToken');
        if (token) {
          // נניח שיש לך פונקציה ב-API שמאמתת טוקן ומחזירה פרטי משתמש
          // const userData = await api.validateToken(token);
          // setUser(userData);

          // --- הדמיה ללא API ---
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user during auth check", e);
                localStorage.removeItem('currentUser'); // אם יש בעיה, נקה
                localStorage.removeItem('authToken'); // גם טוקן אם קיים
            }
          } else {
            // אם אין משתמש שמור אך יש טוקן, ייתכן שתרצה למחוק את הטוקן
            localStorage.removeItem('authToken');
          }
          // --- סוף הדמיה ---

        } else {
          setUser(null); // אם אין טוקן, המשתמש לא מחובר
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
        setUser(null); // במקרה של שגיאה, המשתמש לא מחובר
        // setAuthError("Failed to verify authentication."); // אפשר להציג שגיאה
        localStorage.removeItem('authToken'); // נקה טוקן אם האימות נכשל
        localStorage.removeItem('currentUser');
      } finally {
        setLoadingAuth(false);
      }
    };

    checkLoggedIn();
  }, []);

  // פונקציית התחברות
  const login = async (credentials) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      // כאן תהיה קריאת API להתחברות
      // לדוגמה:
      // const response = await api.login(credentials);
      // const { user: userData, token } = response.data;
      // setUser(userData);
      // localStorage.setItem('authToken', token);
      // localStorage.setItem('currentUser', JSON.stringify(userData)); // שמירת פרטי משתמש (אופציונלי)
      // return userData;


      // --- הדמיה ללא API ---
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            const mockUser = {
              id: '1',
              fullName: "משתמש בדיקה",
              email: "test@example.com",
              role: "user", // דוגמה לתפקיד
              // ... עוד פרטים
            };
            setUser(mockUser);
            localStorage.setItem('authToken', 'dummy-auth-token'); // טוקן דמה
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            setLoadingAuth(false);
            resolve(mockUser);
          } else {
            const err = "שם משתמש או סיסמה שגויים (הדמיה)";
            setAuthError(err);
            setLoadingAuth(false);
            reject(new Error(err));
          }
        }, 1000);
      });
      // --- סוף הדמיה ---

    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "ההתחברות נכשלה. אנא נסה שוב.";
      setAuthError(errorMessage);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      throw error; // זרוק את השגיאה הלאה כדי שהקומפוננטה הקוראת תוכל לטפל בה
    }
  };

  // פונקציית התנתקות
  const logout = async () => {
    setLoadingAuth(true); // אפשר להוסיף מצב טעינה גם להתנתקות
    setAuthError(null);
    try {
      // כאן יכולה להיות קריאת API לביטול הטוקן בשרת (invalidate token)
      // await api.logout(); // אם יש לך endpoint כזה

      // --- הדמיה ללא API ---
      await new Promise(resolve => setTimeout(resolve, 500)); // הדמיית קריאת רשת
      // --- סוף הדמיה ---
    } catch (error) {
      console.error("Error during logout API call (if any):", error);
      // בדרך כלל נמשיך עם ניקוי מקומי גם אם ה-API נכשל,
      // אלא אם כן זה קריטי שהטוקן יבוטל בצד השרת לפני הניקוי המקומי.
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      // אופציונלי: נתב לדף הבית או לדף התחברות לאחר התנתקות
      // navigate('/login');
    }
  };

  // פונקציית הרשמה (דומה להתחברות)
  const register = async (userData) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      // קריאת API להרשמה
      // const response = await api.register(userData);
      // const { user: newUserData, token } = response.data;
      // setUser(newUserData);
      // localStorage.setItem('authToken', token);
      // localStorage.setItem('currentUser', JSON.stringify(newUserData));
      // return newUserData;

      // --- הדמיה ללא API ---
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // בדוק אם המשתמש כבר "קיים" (בהדמיה)
          if (localStorage.getItem('registeredUserEmail') === userData.email) {
            const err = "משתמש עם אימייל זה כבר רשום (הדמיה).";
            setAuthError(err);
            setLoadingAuth(false);
            reject(new Error(err));
            return;
          }

          const mockUser = {
            id: Math.random().toString(36).substring(7), // ID רנדומלי
            fullName: userData.fullName,
            email: userData.email,
            role: "user",
            // ... עוד פרטים
          };
          setUser(mockUser);
          localStorage.setItem('authToken', 'dummy-auth-token-register');
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('registeredUserEmail', userData.email); // שמירת האימייל הרשום להדמיה
          setLoadingAuth(false);
          resolve(mockUser);
        }, 1000);
      });
      // --- סוף הדמיה ---

    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "ההרשמה נכשלה. אנא נסה שוב.";
      setAuthError(errorMessage);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      throw error;
    }
  };

  // פונקציה לעדכון פרטי משתמש (אם יש לך תכונה כזו)
  const updateUserProfile = async (profileData) => {
    if (!user) return null; // רק אם משתמש מחובר
    // setLoadingAuth(true); // אם זה לוקח זמן, אפשר להציג טעינה
    // setAuthError(null);
    try {
      // קריאת API לעדכון פרופיל
      // const updatedUserData = await api.updateProfile(user.id, profileData);
      // setUser(updatedUserData);
      // localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
      // return updatedUserData;

      // --- הדמיה ללא API ---
      return new Promise((resolve) => {
        setTimeout(() => {
          const updatedUser = { ...user, ...profileData };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          // setLoadingAuth(false);
          resolve(updatedUser);
        }, 500);
      });
      // --- סוף הדמיה ---
    } catch (error) {
      console.error("Failed to update user profile:", error);
      // setAuthError("Failed to update profile.");
      // setLoadingAuth(false);
      throw error;
    }
  };


  // הערכים שיועברו דרך הקונטקסט
  const contextValue = {
    user,
    isAuthenticated: !!user, // הופך את user לבוליאני (true אם user קיים, false אם null)
    loadingAuth,
    authError,
    setAuthError, // אפשרות לאפס שגיאות מבחוץ
    login,
    logout,
    register,
    updateUserProfile, // הוספת הפונקציה החדשה
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};