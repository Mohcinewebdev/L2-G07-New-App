import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;
    if (!user) {
      setError('Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Check if the user already has a profile in the public.profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // First login after email confirmation — create profile from user_metadata
      const meta = user.user_metadata || {};
      const role = meta.role || 'student';
      const full_name = meta.full_name || '';
      const module = meta.module || '';

      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        name: full_name,
        role: role,
        module: module,
      });
    }

    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col bg-white">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-inner">
              L2
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8 font-medium">
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
