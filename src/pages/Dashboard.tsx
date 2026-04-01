import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Plus, Book, FileText, Upload, LogOut,
  X, Loader2, CheckCircle, Calendar, Edit2, Save, AlertCircle, BookOpen, GraduationCap
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
}

interface LessonForm {
  title: string;
  description: string;
  course_id: string;
  module: string;
  semester: number;
  file: File | null;
}

interface AssignmentForm {
  title: string;
  description: string;
  course_id: string;
  module: string;
  semester: number;
  deadline: string;
}

type Modal = 'none' | 'lesson' | 'assignment';

// ─── Component Helpers ────────────────────────────────────────────────────────
function SelectInput({
  value, onChange, courses, disabled,
}: {
  value: string;
  onChange: (v: { id: string, name: string }) => void;
  courses: Course[];
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        required
        value={value}
        onChange={(e) => {
          const c = courses.find(x => x.id === e.target.value);
          if (c) onChange({ id: c.id, name: c.name });
        }}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none font-medium text-slate-700 bg-white appearance-none cursor-pointer pr-10 disabled:opacity-60"
      >
        <option value="">— Select a module —</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function SemesterToggle({
  value, onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex p-1 bg-slate-100 rounded-xl w-full">
      <button
        type="button"
        onClick={() => onChange(1)}
        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
          value === 1 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        Semester 1
      </button>
      <button
        type="button"
        onClick={() => onChange(2)}
        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
          value === 2 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        Semester 2
      </button>
    </div>
  );
}

function SuccessScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-10 gap-3">
      <CheckCircle className="w-14 h-14 text-green-500" />
      <p className="font-semibold text-slate-700 text-lg text-center">{message}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [teacherModule, setTeacherModule] = useState('');
  const [userId, setUserId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<Modal>('none');

  // Lesson form
  const [lessonForm, setLessonForm] = useState<LessonForm>({ title: '', description: '', course_id: '', module: '', semester: 1, file: null });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonSuccess, setLessonSuccess] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assignment form
  const [asgForm, setAsgForm] = useState<AssignmentForm>({ title: '', description: '', course_id: '', module: '', semester: 1, deadline: '' });
  const [asgLoading, setAsgLoading] = useState(false);
  const [asgSuccess, setAsgSuccess] = useState(false);
  const [asgError, setAsgError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const uid = session.user.id;
      setUserId(uid);

      // Fetch dynamic courses
      const { data: dbCourses } = await supabase.from('courses').select('id, name');
      if (!ignore && dbCourses) setCourses(dbCourses);

      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, module')
        .eq('id', uid)
        .single();

      if (!ignore) {
        if (error || !data) {
          const meta = session.user.user_metadata ?? {};
          setRole(meta.role ?? 'student');
          setUserName(meta.full_name ?? session.user.email ?? '');
          setTeacherModule(meta.module ?? '');
        } else {
          setRole(data.role);
          setUserName(data.name ?? '');
          setTeacherModule(data.module ?? '');
        }
        
        // Auto-match module from profile to dynamic courses
        if (dbCourses) {
          const matched = dbCourses.find(c => c.name === (data?.module || session.user.user_metadata?.module));
          if (matched) {
            setLessonForm(f => ({ ...f, module: matched.name, course_id: matched.id }));
            setAsgForm(f => ({ ...f, module: matched.name, course_id: matched.id }));
          }
        }
        
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/login');
    });
    return () => { ignore = true; listener.subscription.unsubscribe(); };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    const { error } = await supabase.from('profiles').update({ name: newName.trim() }).eq('id', userId);
    if (!error) {
       setUserName(newName.trim());
       setEditingName(false);
    }
    setSavingName(false);
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLessonLoading(true);
    setLessonError(null);

    if (!lessonForm.module) {
      setLessonError('Please select a module.');
      setLessonLoading(false);
      return;
    }

    let pdfUrl: string | null = null;

    // Upload file to Supabase Storage
    if (lessonForm.file) {
      const fileName = `${Date.now()}-${lessonForm.file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('courses') // Using 'courses' bucket
        .upload(fileName, lessonForm.file);

      if (uploadError) {
        setLessonError(`Upload failed: ${uploadError.message}`);
        setLessonLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('courses').getPublicUrl(fileName);
      pdfUrl = urlData.publicUrl;
    }

    // Insert lesson
    const { error: insertError } = await supabase.from('lessons').insert({
      title: lessonForm.title,
      description: lessonForm.description || null,
      pdf_url: pdfUrl,
      course_id: lessonForm.course_id || null, // FIX: save course_id
      module: lessonForm.module,
      semester: lessonForm.semester,
      teacher_id: userId,
    });

    if (insertError) {
      setLessonError(insertError.message);
    } else {
      setLessonSuccess(true);
      setTimeout(() => {
        setLessonSuccess(false);
        setActiveModal('none');
        setLessonForm({ title: '', description: '', course_id: '', module: teacherModule, semester: 1, file: null });
      }, 2000);
    }
    setLessonLoading(false);
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAsgLoading(true);
    setAsgError(null);

    const { error: insertError } = await supabase.from('assignments').insert({
      title: asgForm.title,
      description: asgForm.description || null,
      deadline: asgForm.deadline || null,
      course_id: asgForm.course_id || null, // FIX: save course_id
      module: asgForm.module,
      semester: asgForm.semester,
      teacher_id: userId,
    });

    if (insertError) {
      setAsgError(insertError.message);
    } else {
      setAsgSuccess(true);
      setTimeout(() => {
        setAsgSuccess(false);
        setActiveModal('none');
        setAsgForm({ title: '', description: '', course_id: '', module: teacherModule, semester: 1, deadline: '' });
      }, 2000);
    }
    setAsgLoading(false);
  };

  const closeModal = () => {
    setActiveModal('none');
    setLessonError(null); setLessonSuccess(false);
    setAsgError(null); setAsgSuccess(false);
  };

  if (loading)
    return <div className="text-center py-20 font-medium text-slate-500">Loading dashboard...</div>;

  if (role !== 'teacher') {
    return (
      <div className="text-center py-20 px-4">
        <div className="inline-flex p-4 rounded-3xl bg-rose-50 text-rose-500 mb-4">
          <Settings className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Teacher Dashboard Only</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          Only registered faculty can access this area.
        </p>
        <button onClick={handleSignOut} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium inline-flex items-center gap-2">
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
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-400 outline-none bg-transparent w-64"
              />
              <button onClick={handleSaveName} disabled={savingName} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
              <button
                onClick={() => { setNewName(userName); setEditingName(true); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                title="Edit your name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-slate-500 mt-1">
            Welcome, <span className="font-semibold text-slate-700">{userName}</span>
            {teacherModule && (
              <> — <span className="text-indigo-600 font-medium">{teacherModule}</span> faculty</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveModal('lesson')}
          className="glass-panel p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group bg-white/50"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Course</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Create a new lesson by uploading a PDF material directly from your device.</p>
          <div className="flex items-center justify-between text-indigo-600 font-bold text-sm">
             <span>Get Started</span>
             <Plus className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setActiveModal('assignment')}
          className="glass-panel p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group bg-white/50"
        >
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Add Assignment</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Post a new task or homework for your students with a specific deadline.</p>
          <div className="flex items-center justify-between text-rose-600 font-bold text-sm">
             <span>Post Task</span>
             <Plus className="w-4 h-4" />
          </div>
        </div>

        <div 
          className="glass-panel p-8 rounded-3xl border border-slate-100 shadow-sm opacity-60 bg-slate-50 flex flex-col justify-center items-center text-center italic"
        >
          <Book className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-400 text-sm">More tools coming soon...</p>
        </div>
      </div>

      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex gap-4 items-start">
        <AlertCircle className="w-6 h-6 text-indigo-500 shrink-0" />
        <div className="text-sm text-indigo-900 leading-relaxed">
          <p className="font-bold mb-1">Teacher Tip:</p>
          Lessons you upload will be visible on the module page instantly. You can choose which semester they belong to during upload.
        </div>
      </div>

      {/* MODALS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-10 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'lesson' && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Upload className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Upload Course</h2>
                    <p className="text-sm text-slate-500">Pick a module and upload your PDF</p>
                  </div>
                </div>

                {lessonSuccess ? (
                  <SuccessScreen message="Lesson uploaded successfully! It now appears on the module page." />
                ) : (
                  <form onSubmit={handleAddLesson} className="space-y-6">
                    {lessonError && (
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium border border-rose-100">{lessonError}</div>
                    )}
                    
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Module</label>
                       <SelectInput 
                         value={lessonForm.course_id} 
                         courses={courses}
                         onChange={(c) => setLessonForm({...lessonForm, module: c.name, course_id: c.id})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Semester</label>
                       <SemesterToggle 
                         value={lessonForm.semester} 
                         onChange={(v) => setLessonForm({...lessonForm, semester: v})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Course Title</label>
                       <input 
                         type="text" required
                         placeholder="e.g. Introduction to Phonetics"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                         value={lessonForm.title}
                         onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">PDF File</label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all group"
                       >
                         {lessonForm.file ? (
                           <div className="flex flex-col items-center gap-2">
                              <FileText className="w-10 h-10 text-indigo-500" />
                              <span className="text-sm font-bold text-slate-700 truncate w-full px-4">{lessonForm.file.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Click to change</span>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center">
                              <Upload className="w-10 h-10 text-slate-200 mb-3 group-hover:text-indigo-300 transition-colors" />
                              <p className="text-sm font-bold text-slate-400">Click to Select PDF</p>
                              <p className="text-xs text-slate-300 mt-1">Maximum size: 10MB</p>
                           </div>
                         )}
                         <input 
                           ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                           onChange={(e) => setLessonForm({...lessonForm, file: e.target.files?.[0] || null})}
                         />
                       </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={closeModal} disabled={lessonLoading}
                        className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={lessonLoading || !lessonForm.file}
                        className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                        {lessonLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Course'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeModal === 'assignment' && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Add Assignment</h2>
                    <p className="text-sm text-slate-500">Create a task for your students</p>
                  </div>
                </div>

                {asgSuccess ? (
                  <SuccessScreen message="Assignment posted successfully!" />
                ) : (
                  <form onSubmit={handleAddAssignment} className="space-y-6">
                    {asgError && (
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium border border-rose-100">{asgError}</div>
                    )}
                    
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Module</label>
                       <SelectInput 
                         value={asgForm.course_id} 
                         courses={courses}
                         onChange={(c) => setAsgForm({...asgForm, module: c.name, course_id: c.id})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Semester</label>
                       <SemesterToggle 
                         value={asgForm.semester} 
                         onChange={(v) => setAsgForm({...asgForm, semester: v})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Assignment Title</label>
                       <input 
                         type="text" required
                         placeholder="e.g. Essay on Academic Writing"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium"
                         value={asgForm.title}
                         onChange={(e) => setAsgForm({...asgForm, title: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 ml-1">Deadline</label>
                       <input 
                         type="datetime-local"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium"
                         value={asgForm.deadline}
                         onChange={(e) => setAsgForm({...asgForm, deadline: e.target.value})}
                       />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={closeModal} disabled={asgLoading}
                        className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={asgLoading}
                        className="flex-1 py-4 px-6 rounded-2xl bg-rose-500 text-white font-black hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                        {asgLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Assignment'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
