import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { UserPlus, Loader2, GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';

const MODULES = [
  'Phonetics & Linguistics',
  'Reading & Text Analysis',
  'Written EXP',
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
  const [module, setModule] = useState(MODULES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Sign up and store role + name + module inside user_metadata
    // so it's available after email confirmation when they first log in
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
          module: module,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Show a success message asking them to check their email
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] py-10">
        <div className="w-full max-w-md">
          <div className="glass-panel p-10 rounded-3xl shadow-xl flex flex-col items-center text-center bg-white">
            <div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Check Your Email!</h2>
            <p className="text-slate-500 mb-2">
              We sent a confirmation link to <span className="font-semibold text-slate-700">{email}</span>.
            </p>
            <p className="text-slate-500 mb-8">
              Click the link in the email to verify your account, then come back and sign in. Your role and details are saved and ready!
            </p>
            <Link
              to="/login"
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
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
          <p className="text-center text-slate-500 mb-8 font-medium">
            Join the L2 G07 platform
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Role Selection */}
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

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                placeholder="John Doe"
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
                placeholder="you@university.edu"
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

            {/* Module Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block" htmlFor="module">
                Module
              </label>
              <select
                id="module"
                required
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-700 font-medium bg-white"
              >
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-lg ${
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
