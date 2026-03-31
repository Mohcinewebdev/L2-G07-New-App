import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Book, FileText, Upload, LogOut, FolderPlus, X, Loader2 } from 'lucide-react';

const MODULES = [
  'Phonetics & Linguistics',
  'Reading & Text Analysis',
  'Written EXP',
  'Grammar',
  'Study Skills',
  'Literature',
  'Civilization',
];

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Add Course form state
  const [courseModule, setCourseModule] = useState(MODULES[0]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePdfUrl, setCoursePdfUrl] = useState('');
  const [courseYoutubeUrl, setCourseYoutubeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        .select('role, name')
        .eq('id', userId)
        .single();

      if (!ignore) {
        if (error || !data) {
          setRole('student');
        } else {
          setRole(data.role);
          setUserName(data.name || session.user.user_metadata?.full_name || null);
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
    setSubmitting(true);
    setSubmitError(null);

    // Find the course id that matches the selected module name
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('name', courseModule)
      .single();

    if (courseError || !courseData) {
      setSubmitError(`Could not find the module "${courseModule}" in the database. Make sure the courses table is populated.`);
      setSubmitting(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    const { error: lessonError } = await supabase.from('lessons').insert({
      course_id: courseData.id,
      teacher_id: session?.user?.id,
      title: courseTitle,
      description: courseDescription,
      pdf_url: coursePdfUrl || null,
      youtube_url: courseYoutubeUrl || null,
    });

    if (lessonError) {
      setSubmitError(lessonError.message);
    } else {
      setSubmitSuccess(true);
      setCourseTitle('');
      setCourseDescription('');
      setCoursePdfUrl('');
      setCourseYoutubeUrl('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowAddCourse(false);
      }, 2000);
    }

    setSubmitting(false);
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {userName ? `Welcome back, ${userName}!` : 'Manage your courses, lessons, and assignments'}
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

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Add Course Card */}
        <button
          onClick={() => setShowAddCourse(true)}
          className="glass-panel p-6 rounded-2xl shadow-sm border-2 border-primary/30 bg-primary/5 relative overflow-hidden group cursor-pointer hover:border-primary transition-colors text-left"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Add Course</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Publish a new lesson or PDF to one of the 7 modules.
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-primary">
            <span>Upload Now</span>
            <Plus className="w-4 h-4" />
          </div>
        </button>

        {/* New Lesson */}
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

        {/* New Assignment */}
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

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => { setShowAddCourse(false); setSubmitSuccess(false); setSubmitError(null); }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Add Course / Lesson</h2>
              <p className="text-slate-500 text-sm mt-1">Publish new material to a module.</p>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8 text-green-600">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-lg">Course added successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleAddCourse} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {submitError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 block">Module</label>
                  <select
                    value={courseModule}
                    onChange={(e) => setCourseModule(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 font-medium bg-white"
                  >
                    {MODULES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 block">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Introduction to Phonemes"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 block">Description</label>
                  <textarea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Short description of this lesson..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400 font-medium resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 block">PDF URL <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="url"
                    value={coursePdfUrl}
                    onChange={(e) => setCoursePdfUrl(e.target.value)}
                    placeholder="https://example.com/lesson.pdf"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 block">YouTube URL <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="url"
                    value={courseYoutubeUrl}
                    onChange={(e) => setCourseYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 mt-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FolderPlus className="w-5 h-5" /> Publish Course</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
