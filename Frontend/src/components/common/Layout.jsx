import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

// Import UI components
import { Button } from '../ui/button';
import LoadingSpinner from '../ui/LoadingSpinner';

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
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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

// NavLink Component
const NavLink = ({ to, icon: Icon, label, onClick, className = '' }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(to) && to.length > 1);

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-amber-600 text-white dark:bg-amber-500'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-700 dark:hover:text-amber-400'
      } ${className}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && <Icon className="w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0" />}
      <span>{label}</span>
    </Link>
  );
};

// User Dropdown Component (for desktop)
const UserDropdown = ({ user, onLogout, isOpen, onToggle }) => {
  const navigate = useNavigate();

  const userInitial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U';

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex items-center space-x-2 rtl:space-x-reverse px-2 py-1 sm:px-3 sm:py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className="h-8 w-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
          {userInitial}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
          {user?.fullName || user?.email?.split('@')[0]}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden sm:inline" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
            role="presentation"
          />

          {/* Dropdown Menu */}
          <div
            className="absolute left-0 rtl:right-0 rtl:left-auto mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20"
            dir="rtl"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.fullName || 'משתמש רשום'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  navigate('/profile');
                  onToggle();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                type="button"
              >
                <UserIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                פרופיל
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  onToggle();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                type="button"
              >
                <Settings className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                הגדרות
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 py-1">
              <button
                onClick={() => {
                  onLogout();
                  onToggle();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                type="button"
              >
                <LogOut className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                התנתקות
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main Layout Component
const Layout = () => {
  const { isAuthenticated, user, logout, loadingAuth } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const commonNavLinks = [
    { to: '/dashboard', icon: Home, label: 'לוח בקרה' },
    { to: '/collection', icon: Library, label: 'האוסף שלי' },
    { to: '/tastings', icon: GlassWater, label: 'טעימות' },
    { to: '/discover', icon: SearchIcon, label: 'גילוי' },
  ];

  // Close dropdowns when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event) => {
      setUserDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loadingAuth) {
    return (
      <div
        className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900"
        dir="rtl"
      >
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link
                to="/"
                className="flex items-center text-amber-600 dark:text-amber-400"
              >
                <Wine className="h-8 w-8 mr-2 rtl:ml-2 rtl:mr-0" />
                <span className="text-xl font-semibold">אוסף הוויסקי</span>
              </Link>
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <LoadingSpinner size="lg" message="טוען אפליקציה..." />
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
      dir="rtl"
    >
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <Wine className="h-8 w-8 mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="text-xl font-semibold">אוסף הוויסקי</span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
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

            {/* Right side controls */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ThemeToggle />

              {isAuthenticated && user ? (
                <UserDropdown
                  user={user}
                  onLogout={handleLogout}
                  isOpen={userDropdownOpen}
                  onToggle={() => setUserDropdownOpen(!userDropdownOpen)}
                />
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-md"
                  type="button"
                >
                  <LogIn className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  התחברות
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center py-5 sm:py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} אוסף הוויסקי שלי. כל הזכויות שמורות.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
