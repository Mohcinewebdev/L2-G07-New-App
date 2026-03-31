import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Users, LogIn, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUserName(meta?.full_name || session.user.email?.split('@')[0] || null);
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUserName(meta?.full_name || session.user.email?.split('@')[0] || null);
      } else {
        setUserName(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
                  L2
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800">
                  L2 | G07
                </span>
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
                      isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg truncate max-w-[140px]">
                    👋 {userName}
                  </span>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-gray-200 animate-in slide-in-from-top-2">
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
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm font-semibold text-slate-700">
                      👋 {userName}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-primary"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-primary"
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
      <footer className="glass-panel border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} L2 | G07 English Department. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
