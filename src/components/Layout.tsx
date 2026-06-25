import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Users, LogIn, Menu, X, LayoutDashboard, LogOut, User, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, session, signOut: authSignOut } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSignOut = async () => {
    await authSignOut();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Teachers', path: '/teachers', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b dark:border-slate-800 border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
                  L2
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">L2 | G07</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                      isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth section */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {session ? (
                // Logged-in: show user's name + dashboard link + sign out
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group transition-all">
                      <User className="w-4 h-4 group-hover:scale-110" />
                    </div>
                    <span className="max-w-[120px] truncate">{userName}</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                // Not logged in: show Sign In button
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button & Dark mode toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-slate-800 focus:outline-none"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-slate-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-gray-200 dark:border-slate-800 animate-in slide-in-from-top-2 bg-white dark:bg-slate-900">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 dark:border-slate-800 mt-2 pt-2 space-y-1">
                {session ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800"
                    >
                      <User className="w-5 h-5 text-primary" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl text-base font-bold text-primary bg-primary/5 dark:bg-primary/10"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-base font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-gray-200 dark:border-slate-800 mt-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Developed And Designed By MOHCENE ZIADI | L2 | G07 English Department. 2025-2026 All rights reserved. 
          </p>
        </div>
      </footer>
    </div>
  );
}
