import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, FileText, Calendar, Clock, BookOpen,
  GraduationCap, AlertCircle, FileDown, Loader2,
  Trash2, Edit2, X, Save, Check, ExternalLink
} from 'lucide-react';

// ─── Slug → module config ─────────────────────────────────────────────────────
const MODULE_CONFIG: Record<string, {
  name: string;
  description: string;
  gradient: string;
  accent: string;
  badgeBg: string;
}> = {
  phonetics: {
    name: 'Phonetics & Linguistics',
    description: 'Study of sounds and language structure — phonemic systems, articulatory phonetics, and linguistic theory.',
    gradient: 'from-violet-500 to-purple-600',
    accent: 'text-violet-600',
    badgeBg: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  reading: {
    name: 'Reading & Text Analysis',
    description: 'Develop critical reading skills to analyse academic and literary texts with depth and confidence.',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  'written-exp': {
    name: 'Written Expression',
    description: 'Master academic writing conventions, essay structure, argumentation, and expressive written communication.',
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  grammar: {
    name: 'Grammar',
    description: 'Build a solid foundation in English grammar rules, syntax, tense usage, and correct application in context.',
    gradient: 'from-orange-500 to-amber-500',
    accent: 'text-orange-600',
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  'study-skills': {
    name: 'Study Skills',
    description: 'Learn effective research methods, note-taking, time management, and evidence-based exam preparation.',
    gradient: 'from-cyan-500 to-sky-600',
    accent: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  },
  literature: {
    name: 'Literature',
    description: 'Explore classic and contemporary works, literary movements, themes, and critical interpretation.',
    gradient: 'from-rose-500 to-pink-600',
    accent: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  civilization: {
    name: 'Civilization',
    description: 'Survey Western and world civilisations — key historical events, political movements, and cultural heritage.',
    gradient: 'from-yellow-500 to-amber-500',
    accent: 'text-amber-600',
    badgeBg: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
};

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  semester: string | number; // Support both
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  created_at: string;
}

// ─── Inline Edit Component ────────────────────────────────────────────────────
function InlineEdit({
  value,
  onSave,
  onCancel,
  label,
  multiline,
}: {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  label: string;
  multiline?: boolean;
}) {
  const [text, setText] = useState(value);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {multiline ? (
        <textarea
          autoFocus
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium text-slate-700 resize-none"
        />
      ) : (
        <input
          autoFocus
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium text-slate-700"
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onSave(text)}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-3 h-3" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
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

// ─── Download helper ──────────────────────────────────────────────────────────
async function handleDownloadPdf(url: string, title: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${title.replace(/[^a-zA-Z0-9-_ ]/g, '')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab if fetch fails
    window.open(url, '_blank');
  }
}

// ─── PDF Card ─────────────────────────────────────────────────────────────────
function PdfCard({
  lesson,
  accent,
  isTeacher,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  accent: string;
  isTeacher: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start animate-in fade-in slide-in-from-left-2 transition-all">
      <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
        <FileText className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0 w-full">
        <h4 className="font-semibold text-slate-800 text-base leading-tight">{lesson.title}</h4>
        {lesson.description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>
        )}
        <p className="text-xs text-slate-400 mt-2">
          Added {new Date(lesson.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">
        {isTeacher && (
          <>
            <button
              onClick={onEdit}
              className="p-2 rounded-xl text-indigo-500 bg-indigo-50 hover:text-indigo-700 hover:bg-indigo-100 transition-all"
              title="Edit lesson"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:text-rose-700 hover:bg-rose-100 transition-all"
              title="Delete lesson"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        {lesson.pdf_url && (
          <>
            <button
              onClick={() => handleDownloadPdf(lesson.pdf_url!, lesson.title)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              Download
            </button>
            <a
              href={lesson.pdf_url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 border-current ${accent} hover:bg-slate-50 transition-colors`}
            >
              <ExternalLink className="w-4 h-4" />
              View PDF
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function EmptySection({ label, icon: Icon }: { label: string; icon: any }) {
  return (
    <div className="py-12 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-slate-50/50">
      <Icon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">No {label} available</p>
    </div>
  );
}

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? MODULE_CONFIG[slug] : null;
  const { isTeacher } = useAuth();

  const [sem1, setSem1] = useState<Lesson[]>([]);
  const [sem2, setSem2] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'lesson' | 'assignment'; id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    if (!config) return;
    setLoading(true);

    // 1. Fetch ALL lessons
    const { data: allLessons, error: lError } = await supabase
      .from('lessons')
      .select('*');

    if (!lError && allLessons) {
      const matched = allLessons.filter(l =>
        l.module?.toString().trim().toLowerCase() === config.name.toLowerCase() ||
        l.course_id === slug
      );

      setSem1(matched.filter(l => !l.semester || Number(l.semester) === 1));
      setSem2(matched.filter(l => Number(l.semester) === 2));
    }

    // 2. Fetch Assignments
    const { data: allAsgn, error: aError } = await supabase
      .from('assignments')
      .select('*');

    if (!aError && allAsgn) {
      const matchedAsgn = allAsgn.filter(a =>
        a.module?.toString().trim().toLowerCase() === config.name.toLowerCase()
      );
      setAssignments(matchedAsgn);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!config) { setLoading(false); return; }
    loadData();
  }, [slug]);

  // ─── Delete handler ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    const table = deleteTarget.type === 'lesson' ? 'lessons' : 'assignments';
    const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);

    if (!error) {
      if (deleteTarget.type === 'lesson') {
        setSem1(prev => prev.filter(l => l.id !== deleteTarget.id));
        setSem2(prev => prev.filter(l => l.id !== deleteTarget.id));
      } else {
        setAssignments(prev => prev.filter(a => a.id !== deleteTarget.id));
      }
    }

    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  // ─── Edit handlers ──────────────────────────────────────────────────
  const handleSaveLesson = async (id: string, newTitle: string) => {
    const { error } = await supabase.from('lessons').update({ title: newTitle }).eq('id', id);
    if (!error) {
      const update = (l: Lesson) => l.id === id ? { ...l, title: newTitle } : l;
      setSem1(prev => prev.map(update));
      setSem2(prev => prev.map(update));
    }
    setEditingLesson(null);
  };

  const handleSaveAssignment = async (id: string, newTitle: string) => {
    const { error } = await supabase.from('assignments').update({ title: newTitle }).eq('id', id);
    if (!error) {
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, title: newTitle } : a));
    }
    setEditingAssignment(null);
  };

  if (!config) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Module not found.</p>
        <Link to="/courses" className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl inline-block font-semibold">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Back button */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-bold bg-white p-2 pr-4 rounded-xl border border-slate-100 shadow-sm"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back
      </Link>

      {/* Hero Banner */}
      <div className={`rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r ${config.gradient} p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Module Overview</p>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">{config.name}</h1>
          <p className="text-white/80 max-w-2xl leading-relaxed text-sm sm:text-lg font-medium">{config.description}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading materials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">

          {/* ─── Left: Course Materials ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Semester 1 section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${config.badgeBg} shadow-sm`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Semester 01</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase">{sem1.length} Materials</p>
                  </div>
                </div>
              </div>
              {sem1.length > 0 ? (
                <div className="grid gap-4">
                  {sem1.map((l) =>
                    editingLesson === l.id ? (
                      <div key={l.id} className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-md">
                        <InlineEdit
                          value={l.title}
                          label="Edit lesson title"
                          onSave={(val) => handleSaveLesson(l.id, val)}
                          onCancel={() => setEditingLesson(null)}
                        />
                      </div>
                    ) : (
                      <PdfCard
                        key={l.id}
                        lesson={l}
                        accent={config.accent}
                        isTeacher={isTeacher}
                        onEdit={() => setEditingLesson(l.id)}
                        onDelete={() => setDeleteTarget({ type: 'lesson', id: l.id, title: l.title })}
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptySection label="semester 1 courses" icon={FileText} />
              )}
            </section>

            {/* Semester 2 section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${config.badgeBg} shadow-sm`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Semester 02</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase">{sem2.length} Materials</p>
                  </div>
                </div>
              </div>
              {sem2.length > 0 ? (
                <div className="grid gap-4">
                  {sem2.map((l) =>
                    editingLesson === l.id ? (
                      <div key={l.id} className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-md">
                        <InlineEdit
                          value={l.title}
                          label="Edit lesson title"
                          onSave={(val) => handleSaveLesson(l.id, val)}
                          onCancel={() => setEditingLesson(null)}
                        />
                      </div>
                    ) : (
                      <PdfCard
                        key={l.id}
                        lesson={l}
                        accent={config.accent}
                        isTeacher={isTeacher}
                        onEdit={() => setEditingLesson(l.id)}
                        onDelete={() => setDeleteTarget({ type: 'lesson', id: l.id, title: l.title })}
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptySection label="semester 2 courses" icon={BookOpen} />
              )}
            </section>
          </div>

          {/* ─── Right: Assignments ────────────────────────────────────── */}
          <aside className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Assignments</h2>
                <p className="text-xs text-slate-400 font-bold uppercase">{assignments.length} Tasks active</p>
              </div>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-5">
                {assignments.map((a) => {
                  const isOverdue = a.deadline ? new Date(a.deadline) < new Date() : false;
                  const isNew = new Date().getTime() - new Date(a.created_at).getTime() < 48 * 60 * 60 * 1000;

                  if (editingAssignment === a.id) {
                    return (
                      <div key={a.id} className="bg-white rounded-3xl border-2 border-indigo-200 p-6 shadow-md">
                        <InlineEdit
                          value={a.title}
                          label="Edit assignment title"
                          onSave={(val) => handleSaveAssignment(a.id, val)}
                          onCancel={() => setEditingAssignment(null)}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 border-l-8 border-l-rose-500 relative hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      {isNew && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg animate-bounce">
                          New
                        </div>
                      )}

                      {/* Teacher actions */}
                      {isTeacher && (
                        <div className="absolute top-4 right-4 flex gap-1">
                          <button
                            onClick={() => setEditingAssignment(a.id)}
                            className="p-2 rounded-xl text-indigo-500 bg-indigo-50 hover:text-indigo-700 hover:bg-indigo-100 transition-all"
                            title="Edit assignment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'assignment', id: a.id, title: a.title })}
                            className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:text-rose-700 hover:bg-rose-100 transition-all"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <h4 className="font-black text-slate-800 text-lg mb-2 pr-16 leading-tight">{a.title}</h4>
                      {a.description && (
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed font-medium">{a.description}</p>
                      )}

                      {a.deadline && (
                        <div
                          className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-colors ${
                            isOverdue
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {isOverdue ? 'Overdue' : `Due: ${new Date(a.deadline).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptySection label="assignments" icon={Calendar} />
            )}
          </aside>

        </div>
      )}

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
