import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, fetchCurrentUser } from '../services/api'; // Import API functions

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Check if the hook is used within an AuthProvider
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Context Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Authenticated user object, or null
  const [loadingAuth, setLoadingAuth] = useState(true); // Is initial authentication check loading
  const [authError, setAuthError] = useState(null); // Authentication errors
  const navigate = useNavigate();

  // Initial authentication check (e.g., check for saved token in localStorage)
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoadingAuth(true);
      setAuthError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            // Attempt to fetch current user with the token
            const userData = await fetchCurrentUser(token);
            setUser(userData);
          } catch (error) {
            console.error("Token validation failed or user data fetch error:", error);
            // If token is invalid or user data cannot be fetched, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            setUser(null);
          }
        } else {
          setUser(null); // No token, user is not logged in
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
        setUser(null); // In case of any error, user is not logged in
        localStorage.removeItem('authToken'); // Clear token if check fails
        localStorage.removeItem('currentUser');
      } finally {
        setLoadingAuth(false);
      }
    };

    checkLoggedIn();
  }, []); // Run once on component mount

  // Login function
  const login = async (credentials) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      // Call the actual login API
      const response = await loginUser(credentials.email, credentials.password);
      const { access_token } = response;

      // Fetch user details using the access token
      const userData = await fetchCurrentUser(access_token);

      setUser(userData);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('currentUser', JSON.stringify(userData)); // Store user details (optional, but good for quick access)
      
      setLoadingAuth(false);
      return userData; // Return user data on success
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "ההתחברות נכשלה. אנא נסה שוב.";
      setAuthError(errorMessage);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      throw error; // Re-throw error for calling component to handle
    }
  };

  // Logout function
  const logout = async () => {
    setLoadingAuth(true); // Can show loading state for logout
    setAuthError(null);
    try {
      // If your backend has a logout endpoint that invalidates tokens, call it here.
      // await api.logout(); // Example: await logoutApiCall();
    } catch (error) {
      console.error("Error during logout API call (if any):", error);
      // Usually proceed with local cleanup even if API call fails,
      // unless token invalidation is critical before local cleanup.
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      // Optional: navigate to home or login page after logout
      // navigate('/login');
    }
  };

  // Register function
  const register = async (userData) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      // Call the actual register API
      const newUser = await registerUser(userData.fullName, userData.email, userData.password);
      
      // After successful registration, automatically log in the user
      // This will get the access token and set the user state.
      // This is crucial because the /register endpoint doesn't return a token directly.
      const loggedInUser = await login({ email: userData.email, password: userData.password });

      setLoadingAuth(false);
      return loggedInUser; // Return the logged-in user data
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error.message || "ההרשמה נכשלה. אנא נסה שוב.";
      setAuthError(errorMessage);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setLoadingAuth(false);
      throw error; // Re-throw error for calling component to handle
    }
  };

  // Update user profile function (if you have such a feature)
  const updateUserProfile = async (profileData) => {
    if (!user) return null; // Only if user is logged in
    // setLoadingAuth(true); // Can show loading state if it takes time
    // setAuthError(null);
    try {
      // Call API to update profile
      // const updatedUserData = await api.updateProfile(user.id, profileData);
      // setUser(updatedUserData);
      // localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
      // return updatedUserData;

      // Mock update for now
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
      // setAuthError("Failed to update profile.");
      // setLoadingAuth(false);
      throw error;
    }
  };

  // Values passed through the context
  const contextValue = {
    user,
    isAuthenticated: !!user, // Convert user object to boolean
    loadingAuth,
    authError,
    setAuthError, // Allow resetting errors from outside
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