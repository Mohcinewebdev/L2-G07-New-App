import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Book, FileText, Upload, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!ignore) {
        if (error || !data) {
          console.log('Profile error:', error);
          setRole('student');
        } else {
          setRole(data.role);
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

  if (loading)
    return (
      <div className="text-center py-20 font-medium text-slate-500">
        Loading dashboard...
      </div>
    );

  if (role !== 'teacher') {
    return (
      <div className="text-center py-20 px-4">
        <div className="inline-flex p-4 rounded-3xl bg-rose-50 text-rose-500 mb-4">
          <Settings className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          You don't have permission to access the teacher dashboard. Only registered faculty can manage courses.
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Teacher Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your courses, lessons, and assignments
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
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

        <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden group cursor-pointer hover:border-rose-500/30 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              New Assignment
            </h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Create a new assignment task with a specific deadline string.
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-rose-600">
            <span>Add Assignment</span>
            <Plus className="w-4 h-4" />
          </div>
        </div>

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

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
        <strong>Note:</strong> Forms for these precise actions require database hookup and components logic.
      </div>
    </div>
  );
}
