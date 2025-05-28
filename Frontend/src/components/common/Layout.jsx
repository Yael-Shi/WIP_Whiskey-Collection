import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import UI components
import { Button } from '../ui/button';
import LoadingSpinner from '../ui/LoadingSpinner';

// Import icons from lucide-react
import { 
  Home, 
  Library, 
  GlassWater, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  Settings, 
  Wine, 
  LogIn, 
  Search as SearchIcon, 
  Sun, 
  Moon, 
  ChevronDown, 
  X,
  UserCircle
} from 'lucide-react';

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
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
};

// NavLink Component
const NavLink = ({ to, icon: Icon, label, onClick, className = "" }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to) && to.length > 1);

  return (
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

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose, user, onLogout, onLogin, isAuthenticated }) => {
  if (!isOpen) return null;

  const commonNavLinks = [
    { to: "/dashboard", icon: Home, label: "לוח בקרה" },
    { to: "/collection", icon: Library, label: "האוסף שלי" },
    { to: "/tastings", icon: GlassWater, label: "טעימות" },
    { to: "/discover", icon: SearchIcon, label: "גילוי" }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl" dir="rtl">
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Link to="/" onClick={onClose} className="flex items-center text-amber-600 dark:text-amber-400">
            <Wine className="h-7 w-7 mr-2 rtl:ml-2 rtl:mr-0" />
            <span className="text-lg font-semibold">אוסף הוויסקי</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex flex-col p-4 space-y-2">
          {isAuthenticated ? (
            <>
              {commonNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  onClick={onClose}
                  className="w-full"
                />
              ))}
              
              <div className="border-t dark:border-gray-700 pt-4 mt-4">
                {user && (
                  <div className="flex items-center p-3 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <UserCircle className="h-10 w-10 text-gray-400 mr-3 rtl:ml-3 rtl:mr-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.fullName || 'משתמש רשום'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
                
                <NavLink
                  to="/profile"
                  icon={UserIcon}
                  label="פרופיל"
                  onClick={onClose}
                  className="w-full"
                />
                <NavLink
                  to="/settings"
                  icon={Settings}
                  label="הגדרות"
                  onClick={onClose}
                  className="w-full"
                />
                
                <Button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  variant="ghost"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2"
                >
                  <LogOut className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0" />
                  התנתקות
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <LogIn className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              התחברות
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// User Dropdown Component (for desktop)
const UserDropdown = ({ user, onLogout, isOpen, onToggle }) => {
  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 
                     (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

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
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          
          {/* Dropdown Menu */}
          <div className="absolute left-0 rtl:right-0 rtl:left-auto mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20" dir="rtl">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.fullName || 'משתמש רשום'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            
            <div className="py-1">
              <Link
                to="/profile"
                onClick={onToggle}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                פרופיל
              </Link>
              <Link
                to="/settings"
                onClick={onToggle}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-3 rtl:ml-3 rtl:mr-0" />
                הגדרות
              </Link>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 py-1">
              <button
                onClick={() => {
                  onLogout();
                  onToggle();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
export default function Layout() {
  const { isAuthenticated, user, logout, login, loadingAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Navigate to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await login();
      // Navigation after login is usually handled by the login function or redirect logic
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const commonNavLinks = [
    { to: "/dashboard", icon: Home, label: "לוח בקרה" },
    { to: "/collection", icon: Library, label: "האוסף שלי" },
    { to: "/tastings", icon: GlassWater, label: "טעימות" },
    { to: "/discover", icon: SearchIcon, label: "גילוי" }
  ];

  // Close dropdowns when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = () => {
      setUserDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loadingAuth) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center text-amber-600 dark:text-amber-400">
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200" dir="rtl">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
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
                >
                  <LogIn className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  התחברות
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">פתח תפריט</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        onLogin={handleLogin}
        isAuthenticated={isAuthenticated}
      />

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
}