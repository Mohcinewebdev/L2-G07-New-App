import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, GraduationCap, BookOpen, Mail, CheckCircle } from 'lucide-react';

const MODULES = [
  'Phonetics & Linguistics',
  'Reading & Text Analysis',
  'Written Expression',
  'Grammar',
  'Study Skills',
  'Literature',
  'Civilization',
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (role === 'teacher' && !selectedModule) {
      setError('Please select the module you teach.');
      setLoading(false);
      return;
    }

    // FIX: emailRedirectTo points to the production URL, not localhost
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
          module: role === 'teacher' ? selectedModule : null,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Use upsert so it works even if a partial row already exists
      // Fallback: manually upsert profile in case the trigger fails or RLS allows it
      // This is less critical now that we have a database trigger
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        role: role,
        module: role === 'teacher' ? selectedModule : null,
      });

      if (profileError) {
        console.warn('Profile upsert skipped or failed (expected if email not confirmed):', profileError.message);
      }

      // FIX: if no session yet it means email confirmation is required.
      // Show a friendly message instead of redirecting to /dashboard
      if (!authData.session) {
        setConfirmationSent(true);
        setLoading(false);
        return;
      }

      navigate('/dashboard');
    } else {
      setLoading(false);
    }
  };

  // Email confirmation pending screen
  if (confirmationSent) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] py-10">
        <div className="w-full max-w-lg">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col items-center bg-white text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Check your email!</h2>
            <p className="text-slate-500 mb-4 leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-slate-700">{email}</span>.
              Click it to activate your account — you will be taken directly to your dashboard.
            </p>
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl text-blue-700 text-sm font-medium mb-6 w-full">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span>The link will redirect to the live site, not localhost.</span>
            </div>
            <Link
              to="/login"
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-10">
      <div className="w-full max-w-lg">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col bg-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-inner">
              L2
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Create an Account</h2>
          <p className="text-center text-slate-500 mb-8 font-medium">Join the L2 G07 platform</p>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium ${
                    role === 'student'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-primary/30 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-6 h-6" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium ${
                    role === 'teacher'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                  Teacher
                </button>
              </div>
            </div>

            {/* NEW: Module selector — visible only for teachers */}
            {role === 'teacher' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block" htmlFor="module">
                  Module you teach
                </label>
                <div className="relative">
                  <select
                    id="module"
                    required={role === 'teacher'}
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-700 bg-white appearance-none cursor-pointer pr-10"
                  >
                    <option value="">— Select a module —</option>
                    {MODULES.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Full name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-lg ${
                role === 'teacher'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                  : 'bg-primary hover:bg-primary-dark shadow-primary/30'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up as {role === 'teacher' ? 'Teacher' : 'Student'}
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
