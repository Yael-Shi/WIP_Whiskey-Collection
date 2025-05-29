import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// יצירת הקונטקסט
const AuthContext = createContext(null);

// Hook מותאם אישית לשימוש בקונטקסט האימות
export const useAuth = () => {
  const context = useContext(AuthContext);
  // שינוי כאן: בדיקה ל-null במקום undefined
  if (context === null) { 
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ספק הקונטקסט
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoadingAuth(true);
      setAuthError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error("Failed to parse stored user during auth check", e);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('authToken');
            }
          } else {
            localStorage.removeItem('authToken');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      } finally {
        setLoadingAuth(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (credentials) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            const mockUser = {
              id: '1',
              fullName: "משתמש בדיקה",
              email: "test@example.com",
              role: "user",
            };
            setUser(mockUser);
            localStorage.setItem('authToken', 'dummy-auth-token');
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
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "ההתחברות נכשלה. אנא נסה שוב.";
      setAuthError(errorMessage);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error during logout API call (if any):", error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
    }
  };

  const register = async (userData) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (localStorage.getItem('registeredUserEmail') === userData.email) {
            const err = "משתמש עם אימייל זה כבר רשום (הדמיה).";
            setAuthError(err);
            setLoadingAuth(false);
            reject(new Error(err));
            return;
          }

          const mockUser = {
            id: Math.random().toString(36).substring(7),
            fullName: userData.fullName,
            email: userData.email,
            role: "user",
          };
          setUser(mockUser);
          localStorage.setItem('authToken', 'dummy-auth-token-register');
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('registeredUserEmail', userData.email);
          setLoadingAuth(false);
          resolve(mockUser);
        }, 1000);
      });
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

  const updateUserProfile = async (profileData) => {
    if (!user) return null;
    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const updatedUser = { ...user, ...profileData };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          resolve(updatedUser);
        }, 500);
      });
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    loadingAuth,
    authError,
    setAuthError,
    login,
    logout,
    register,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};