import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Lock, BookOpen, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
        <div className="w-full max-w-lg text-center">
          <div className="glass-panel p-10 sm:p-14 rounded-[2.5rem] shadow-2xl bg-white relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-rose-400/15 to-pink-400/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Lock icon */}
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-8">
                <Lock className="w-9 h-9 text-white" />
              </div>

              {/* Brand */}
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                  L2
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-800">L2 | G07</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
                Welcome to L2 | G07
              </h2>

              <p className="text-slate-500 mb-10 font-medium leading-relaxed max-w-sm mx-auto text-base">
                Please log in or create an account to see your courses and assignments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-base"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-indigo-300 hover:bg-indigo-50/50 hover:-translate-y-0.5 transition-all text-base"
                >
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                <span>English Department — University Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
