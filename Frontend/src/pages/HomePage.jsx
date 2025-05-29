import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { Button } from '@/components/ui/button';

import { Wine, LogIn } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, loadingAuth, loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if authenticated and not loading
    if (!loadingAuth && isAuthenticated) {
      navigate('/dashboard'); // Or createPageUrl("Dashboard") if defined in utils
    }
  }, [isAuthenticated, loadingAuth, navigate]);

  // Display loading indicator while authentication state is being determined
  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-200 via-orange-300 to-yellow-200 dark:from-gray-800 dark:via-gray-900 dark:to-black" dir="rtl">
        <p className="text-xl text-gray-700 dark:text-gray-300">טוען...</p> {/* Loading text */}
      </div>
    );
  }

  // If authenticated, useEffect will handle redirection, so no need to render anything here
  if (isAuthenticated) {
    return null;
  }

  // Handle click for login/register button
  const handleLoginRegisterClick = () => {
    navigate('/login'); // Navigate to login/register page
    // If AuthContext's loginUser function should be used:
    // loginUser();
  };

  return (
    <div
      className="
        relative flex flex-col items-center justify-center min-h-screen
        bg-gradient-to-br from-amber-200 via-orange-300 to-yellow-200
        dark:from-gray-800 dark:via-gray-900 dark:to-black
        text-center p-4 sm:p-6 md:p-8
      "
      dir="rtl" // Set direction to Right-To-Left
    >
      {/* Large central animated icon */}
      <Wine
        className="
          w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48
          text-amber-600 dark:text-amber-400 mb-6
          animate-bounce-custom // Custom bounce animation
        "
      />

      {/* Main heading */}
      <h1
        className="
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold
          text-amber-800 dark:text-amber-200 mb-4
        "
      >
        ברוכים הבאים לאוסף הוויסקי!
      </h1>

      {/* Introductory paragraph */}
      <p
        className="
          text-base sm:text-lg md:text-xl lg:text-2xl
          text-amber-700 dark:text-amber-300 mb-8
          max-w-xl mx-auto
        "
      >
        הפלטפורמה המושלמת לגלות, לתעד ולנהל את אוסף הוויסקי האישי שלכם.
        התחברו כדי להתחיל!
      </p>

      {/* Main call-to-action button */}
      <Button
        onClick={handleLoginRegisterClick}
        size="lg"
        className="
          bg-amber-700 hover:bg-amber-800 text-white
          dark:bg-amber-600 dark:hover:bg-amber-700
          text-lg sm:text-xl md:text-2xl py-3 px-6 rounded-lg
          flex items-center space-x-2 rtl:space-x-reverse
          shadow-lg transform hover:scale-105 transition-transform duration-300
          mb-8 // Adds bottom margin for spacing
        "
      >
        <LogIn className="ml-2 h-6 w-6" /> {/* Icon to the right of text */}
        התחברות / הרשמה
      </Button>

      {/* Secondary text at the bottom */}
      <p
        className="
          text-sm sm:text-base md:text-lg
          text-amber-600 dark:text-amber-400
          mt-auto // Pushes this element to the bottom using flexbox
          py-4 // Adds vertical padding to prevent content from touching bottom edge
        "
      >
        מערכת ניהול האוסף והטעימות המתקדמת בישראל.
      </p>
    </div>
  );
}