import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Library,
  GlassWater,
  User as UserIcon,
  LogOut,
  Settings,
  Wine,
  LogIn,
  Search as SearchIcon,
  Sun,
  Moon,
  ChevronDown,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../ui/button';

// Theme Toggle Component
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  if (typeof window === 'undefined') return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="p-2 rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

// NavLink Component for navigation items
const NavLink = ({ to, icon: Icon, label, className = '' }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(to) && to.length > 1);

  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-amber-600 text-white dark:bg-amber-500'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-700 dark:hover:text-amber-400'
      } ${className}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && <Icon className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />}
      <span>{label}</span>
    </Link>
  );
};

// User Dropdown Component for authenticated users
const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  let userInitial = 'U';
  if (user?.fullName) {
    userInitial = user.fullName.charAt(0).toUpperCase();
  } else if (user?.email) {
    userInitial = user.email.charAt(0).toUpperCase();
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.user-dropdown-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNavigateAndClose = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogoutAndClose = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative user-dropdown-container">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rtl:space-x-reverse px-2 py-1 sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-expanded={isOpen}
        aria-controls="user-menu"
        type="button"
      >
        <div className="h-8 w-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-600 shadow-sm">
          {userInitial !== 'U' ? (
            userInitial
          ) : (
            <UserCircle className="h-5 w-5" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0]}{' '}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div
          id="user-menu"
          className="absolute left-0 rtl:right-0 rtl:left-auto mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1"
          dir="rtl"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.fullName || 'משתמש רשום'}{' '}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>

          <button
            onClick={() => handleNavigateAndClose('/profile')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            <UserIcon className="h-4 w-4 ml-3 rtl:mr-3 rtl:ml-0 text-gray-500 dark:text-gray-400" />{' '}
            פרופיל
          </button>
          <button
            onClick={() => handleNavigateAndClose('/settings')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            type="button"
          >
            <Settings className="h-4 w-4 ml-3 rtl:mr-3 rtl:ml-0 text-gray-500 dark:text-gray-400" />{' '}
            הגדרות
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <button
            onClick={handleLogoutAndClose}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            type="button"
          >
            <LogOut className="h-4 w-4 ml-3 rtl:mr-3 rtl:ml-0" /> התנתקות
          </button>
        </div>
      )}
    </div>
  );
};

// Main Navbar Component
const Navbar = () => {
  const { isAuthenticated, user, logout, login, loadingAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const commonNavLinks = [
    { to: '/dashboard', icon: Home, label: 'לוח בקרה' },
    { to: '/collection', icon: Library, label: 'האוסף שלי' },
    { to: '/tastings', icon: GlassWater, label: 'טעימות' },
    { to: '/discover', icon: SearchIcon, label: 'גילוי' },
  ];

  if (loadingAuth) {
    return (
      <header
        className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40"
        dir="rtl"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full ml-2 rtl:mr-2 rtl:ml-0 animate-pulse" />
              <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40"
      dir="rtl"
    >
      {/* Prettier wants a newline here */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <Wine className="h-8 w-8 ml-2 rtl:mr-2 rtl:ml-0 flex-shrink-0" />{' '}
            <span className="text-xl font-semibold whitespace-nowrap">
              אוסף הוויסקי
            </span>{' '}
          </Link>

          {isAuthenticated && (
            <nav className="flex items-center space-x-1 rtl:space-x-reverse ml-4 rtl:mr-4">
              {/* Prettier wants a newline here */}
              {commonNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                />
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-2 rtl:space-x-reverse mr-4 rtl:ml-4">
            {/* Prettier wants a newline here */}
            <ThemeToggle />
            {isAuthenticated && user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              !loadingAuth && (
                <Button
                  onClick={handleLogin}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1.5 flex-shrink-0"
                  type="button"
                >
                  <LogIn className="ml-1.5 h-4 w-4 rtl:mr-1.5 rtl:ml-0" />{' '}
                  התחברות
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
