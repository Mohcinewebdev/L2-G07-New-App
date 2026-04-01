import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Plus, Book, FileText, Upload, LogOut, X, Loader2, CheckCircle
} from 'lucide-react';

const MODULES = [
  'Phonetics & Linguistics',
  'Reading & Text Analysis',
  'Written Expression',
  'Grammar',
  'Study Skills',
  'Literature',
  'Civilization',
];

interface AddCourseForm {
  title: string;
  module: string;
  description: string;
  pdfUrl: string;
}

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState<AddCourseForm>({
    title: '',
    module: '',
    description: '',
    pdfUrl: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      const userId = session.user?.id;
      if (!userId) {
        navigate('/login');
        return;
      }

      // Try the profiles table first
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .single();

      if (!ignore) {
        if (error || !data) {
          // FIX: fall back to user_metadata (set at sign-up time) instead of
          //      defaulting to 'student', which was blocking teachers.
          const metaRole = session.user?.user_metadata?.role as string | undefined;
          const metaName = session.user?.user_metadata?.full_name as string | undefined;
          setRole(metaRole ?? 'student');
          setUserName(metaName ?? session.user?.email ?? '');
        } else {
          setRole(data.role);
          setUserName(data.name ?? session.user?.email ?? '');
        }
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!courseForm.module) {
      setFormError('Please select a module.');
      setFormLoading(false);
      return;
    }

    // Insert into courses table (adjust column names if yours differ)
    const { error } = await supabase.from('courses').insert({
      name: courseForm.title,
      description: courseForm.description,
      pdf_url: courseForm.pdfUrl,
      theme_color: 'blue',
      module: courseForm.module,
    });

    setFormLoading(false);

    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess(true);
      setCourseForm({ title: '', module: '', description: '', pdfUrl: '' });
      setTimeout(() => {
        setFormSuccess(false);
        setShowAddCourse(false);
      }, 2000);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="text-center py-20 font-medium text-slate-500">
        Loading dashboard...
      </div>
    );

  // ─── Access Denied (non-teacher) ─────────────────────────────────────────────
  if (role !== 'teacher') {
    return (
      <div className="text-center py-20 px-4">
        <div className="inline-flex p-4 rounded-3xl bg-rose-50 text-rose-500 mb-4">
          <Settings className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-2 max-w-sm mx-auto">
          Only registered faculty can access the teacher dashboard.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Logged in as: <strong>{role ?? 'unknown'}</strong>
        </p>
        <button
          onClick={handleSignOut}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    );
  }

  // ─── Teacher Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome, <span className="font-semibold text-slate-700">{userName}</span> — manage your courses, lessons, and assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: Add Course button */}
          <button
            onClick={() => setShowAddCourse(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-colors shadow-sm shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Lesson */}
        <div
          onClick={() => setShowAddCourse(true)}
          className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">New Lesson</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Upload a new PDF document or add a YouTube embed to a course.
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-primary">
            <span>Add Lesson</span>
            <Plus className="w-4 h-4" />
          </div>
        </div>

        {/* Add Assignment */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden group cursor-pointer hover:border-rose-500/30 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">New Assignment</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Create a new assignment task with a specific deadline string.
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-rose-600">
            <span>Add Assignment</span>
            <Plus className="w-4 h-4" />
          </div>
        </div>

        {/* My Courses */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">My Courses</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            View and edit module details, update colors and descriptions.
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-indigo-600">
            <span>Manage</span>
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── Add Course Modal ──────────────────────────────────────────────────── */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => { setShowAddCourse(false); setFormError(null); setFormSuccess(false); }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Add Course</h2>
                <p className="text-sm text-slate-500">Upload a course to a module</p>
              </div>
            </div>

            {formSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle className="w-14 h-14 text-green-500" />
                <p className="font-semibold text-slate-700 text-lg">Course added successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleAddCourse} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {formError}
                  </div>
                )}

                {/* Module */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Module</label>
                  <div className="relative">
                    <select
                      required
                      value={courseForm.module}
                      onChange={(e) => setCourseForm({ ...courseForm, module: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none font-medium text-slate-700 bg-white appearance-none cursor-pointer pr-10"
                    >
                      <option value="">— Select a module —</option>
                      {MODULES.map((mod) => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Course Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Phonetics"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the course content..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none placeholder:text-slate-400 font-medium resize-none"
                  />
                </div>

                {/* PDF URL */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">PDF Link (URL)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/course.pdf"
                    value={courseForm.pdfUrl}
                    onChange={(e) => setCourseForm({ ...courseForm, pdfUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddCourse(false); setFormError(null); }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Course'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
