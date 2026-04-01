import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, FileText, Calendar, Clock, BookOpen,
  GraduationCap, AlertCircle, FileDown, Loader2
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

function PdfCard({ lesson, accent }: { lesson: Lesson; accent: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4 items-start animate-in fade-in slide-in-from-left-2 transition-all">
      <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
        <FileText className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 text-base leading-tight">{lesson.title}</h4>
        {lesson.description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>
        )}
        <p className="text-xs text-slate-400 mt-2">
          Added {new Date(lesson.created_at).toLocaleDateString()}
        </p>
      </div>
      {lesson.pdf_url && (
        <a
          href={lesson.pdf_url}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 border-current ${accent} hover:bg-slate-50 transition-colors shrink-0`}
        >
          <FileDown className="w-4 h-4" />
          View PDF
        </a>
      )}
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

  const [sem1, setSem1] = useState<Lesson[]>([]);
  const [sem2, setSem2] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) { setLoading(false); return; }

    async function load() {
      if (!config) return;
      setLoading(true);
      
      console.log(`[ModulePage] loading module: ${config.name}`);

      // 1. Fetch ALL lessons to debug RLS vs Filter
      const { data: allLessons, error: lError } = await supabase
        .from('lessons')
        .select('*');

      if (lError) {
        console.error(`[Lessons Error]:`, lError.message);
      } else if (allLessons) {
        console.log(`[Lessons Total in DB]:`, allLessons.length);
        
        // Match by module name (Case Insensitive & Trimmed)
        const matched = allLessons.filter(l => 
          l.module?.toString().trim().toLowerCase() === config.name.toLowerCase() ||
          l.course_id === slug // or some other ID match
        );
        
        setSem1(matched.filter(l => !l.semester || Number(l.semester) === 1));
        setSem2(matched.filter(l => Number(l.semester) === 2));
        
        // Update diagnostic info with total unfiltered count
        const debugDiv = document.getElementById('debug-info');
        if (debugDiv) {
           debugDiv.innerHTML += `<p>Total Lessons in Table: ${allLessons.length}</p>`;
        }
      }

      // 2. Fetch Assignments
      const { data: allAsgn, error: aError } = await supabase
        .from('assignments')
        .select('*');

      if (aError) {
        console.error(`[Assignments Error]:`, aError.message);
      } else if (allAsgn) {
        const matchedAsgn = allAsgn.filter(a => 
          a.module?.toString().trim().toLowerCase() === config.name.toLowerCase()
        );
        setAssignments(matchedAsgn);
      }
      
      setLoading(false);
    }

    load();
  }, [slug]);

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
      <div className={`rounded-[2.5rem] bg-gradient-to-r ${config.gradient} p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Module Overview</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">{config.name}</h1>
          <p className="text-white/80 max-w-2xl leading-relaxed text-sm sm:text-lg font-medium">{config.description}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading materials...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">

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
                  {sem1.map((l) => (
                    <PdfCard key={l.id} lesson={l} accent={config.accent} />
                  ))}
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
                  {sem2.map((l) => (
                    <PdfCard key={l.id} lesson={l} accent={config.accent} />
                  ))}
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
                  
                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 border-l-8 border-l-rose-500 relative group hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      {isNew && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg animate-bounce">
                          New
                        </div>
                      )}
                      
                      <h4 className="font-black text-slate-800 text-lg mb-2 pr-6 leading-tight">{a.title}</h4>
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
    </div>
  );
}
