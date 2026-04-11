import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ExternalLink, PlayCircle, FileText, Calendar, Clock,
  Trash2, Edit2, X, Save, Loader2
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  youtube_url: string;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteConfirm({
  itemName,
  onConfirm,
  onCancel,
  loading,
}: {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-50 flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Delete this item?</h3>
        <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-slate-700">"{itemName}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const { isTeacher } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  const [editAssignmentTitle, setEditAssignmentTitle] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'lesson' | 'assignment'; id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function getCourseDetails() {
      if (!id) return;
      
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single();

      if (courseData) {
        setCourse(courseData);
        const cName = courseData.name;
        const [lRes, aRes] = await Promise.all([
          supabase.from('lessons').select('*').or(`course_id.eq.${id},module.eq."${cName}"`).order('created_at', { ascending: false }),
          supabase.from('assignments').select('*').or(`course_id.eq.${id},module.eq."${cName}"`).order('deadline', { ascending: true }),
        ]);
        setLessons(lRes.data || []);
        setAssignments(aRes.data || []);
      }
      
      setLoading(false);
    }
    getCourseDetails();
  }, [id]);

  // ─── Delete handler ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    const table = deleteTarget.type === 'lesson' ? 'lessons' : 'assignments';
    const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);

    if (!error) {
      if (deleteTarget.type === 'lesson') {
        setLessons(prev => prev.filter(l => l.id !== deleteTarget.id));
      } else {
        setAssignments(prev => prev.filter(a => a.id !== deleteTarget.id));
      }
    }

    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  // ─── Edit handlers ──────────────────────────────────────────────────
  const handleSaveLesson = async (lessonId: string) => {
    if (!editLessonTitle.trim()) return;
    const { error } = await supabase.from('lessons').update({ title: editLessonTitle.trim() }).eq('id', lessonId);
    if (!error) {
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, title: editLessonTitle.trim() } : l));
    }
    setEditingLesson(null);
  };

  const handleSaveAssignment = async (asgId: string) => {
    if (!editAssignmentTitle.trim()) return;
    const { error } = await supabase.from('assignments').update({ title: editAssignmentTitle.trim() }).eq('id', asgId);
    if (!error) {
      setAssignments(prev => prev.map(a => a.id === asgId ? { ...a, title: editAssignmentTitle.trim() } : a));
    }
    setEditingAssignment(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-primary font-medium">
        Loading material...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-slate-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium bg-slate-100/50 px-4 py-2 rounded-xl">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">{course.name}</h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">{course.description}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Lessons & Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PlayCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Course Materials</h2>
          </div>

          <div className="space-y-6">
            {lessons.map(lesson => (
              <div key={lesson.id} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm group/lesson relative">
                {/* Teacher actions */}
                {isTeacher && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingLesson(lesson.id); setEditLessonTitle(lesson.title); }}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Edit lesson"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'lesson', id: lesson.id, title: lesson.title })}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {editingLesson === lesson.id ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edit lesson title</label>
                    <input
                      autoFocus
                      type="text"
                      value={editLessonTitle}
                      onChange={e => setEditLessonTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveLesson(lesson.id)}
                      className="w-full px-4 py-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg font-bold text-slate-800"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveLesson(lesson.id)} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button onClick={() => setEditingLesson(null)} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-slate-600 mb-6">{lesson.description}</p>
                    )}

                    <div className="space-y-4">
                      {/* YouTube Embed */}
                      {lesson.youtube_url && (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-900">
                          <iframe 
                            className="w-full h-full"
                            src={lesson.youtube_url.replace('watch?v=', 'embed/').split('&')[0]} 
                            title="YouTube video player" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                          </iframe>
                        </div>
                      )}

                      {/* PDF Viewer/Link */}
                      {lesson.pdf_url && (
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          <div className="p-3 bg-red-50 text-red-500 rounded-lg shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-700 truncate">Document Attachment</h4>
                            <p className="text-xs text-slate-500 mt-0.5">PDF Format</p>
                          </div>
                          <a 
                            href={lesson.pdf_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-semibold rounded-lg shadow-sm border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all shrink-0"
                          >
                            View PDF
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No materials uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assignments */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Assignments</h2>
          </div>

          <div className="space-y-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="card-hover glass-panel p-5 rounded-2xl shadow-sm border-l-4 border-l-rose-500 relative overflow-hidden bg-white/60 group/asg">
                {/* Teacher actions */}
                {isTeacher && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/asg:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingAssignment(assignment.id); setEditAssignmentTitle(assignment.title); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Edit assignment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'assignment', id: assignment.id, title: assignment.title })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {editingAssignment === assignment.id ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edit assignment title</label>
                    <input
                      autoFocus
                      type="text"
                      value={editAssignmentTitle}
                      onChange={e => setEditAssignmentTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveAssignment(assignment.id)}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold text-slate-800"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveAssignment(assignment.id)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                        <Save className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditingAssignment(null)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{assignment.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{assignment.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg inline-flex">
                      <Clock className="w-4 h-4" />
                      Due: {new Date(assignment.deadline).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            ))}

            {assignments.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No assignments yet.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirm
          itemName={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
