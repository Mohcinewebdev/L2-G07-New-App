import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft, FileText, Calendar, Clock, BookOpen,
  GraduationCap, AlertCircle, FileDown
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
  semester: number;
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4 items-start">
      <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
        <FileText className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 text-base leading-tight">{lesson.title}</h4>
        {lesson.description && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{lesson.description}</p>
        )}
        <p className="text-xs text-slate-400 mt-2">
          Added {new Date(lesson.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
          Open
        </a>
      )}
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="py-10 rounded-2xl border-2 border-dashed border-slate-200 text-center">
      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p className="text-sm text-slate-400 font-medium">No {label} yet.</p>
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
      // Fetch lessons for this module, split by semester
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, description, pdf_url, semester, created_at')
        .eq('module', config!.name)
        .order('created_at', { ascending: true });

      // Fetch assignments for this module
      const { data: asgn } = await supabase
        .from('assignments')
        .select('id, title, description, deadline, created_at')
        .eq('module', config!.name)
        .order('created_at', { ascending: false });

      if (lessons) {
        setSem1(lessons.filter((l) => l.semester === 1));
        setSem2(lessons.filter((l) => l.semester === 2));
      }
      if (asgn) setAssignments(asgn);
      setLoading(false);
    }

    load();
  }, [slug, config]);

  if (!config) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Module not found.</p>
        <Link to="/courses" className="mt-4 inline-block text-primary font-semibold hover:underline">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium bg-slate-100/70 px-4 py-2 rounded-xl text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* Hero banner */}
      <div className={`rounded-3xl bg-gradient-to-r ${config.gradient} p-8 sm:p-12 text-white shadow-lg relative overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">L2 | G07</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{config.name}</h1>
        <p className="text-white/80 max-w-2xl leading-relaxed text-sm sm:text-base">{config.description}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ─── Left: Semesters ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Semester 1 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-xl border ${config.badgeBg}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Semester 1</h2>
                  <p className="text-xs text-slate-400">{sem1.length} document{sem1.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {sem1.length > 0 ? (
                <div className="space-y-3">
                  {sem1.map((l) => (
                    <PdfCard key={l.id} lesson={l} accent={config.accent} />
                  ))}
                </div>
              ) : (
                <EmptySection label="semester 1 courses" />
              )}
            </section>

            {/* Semester 2 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-xl border ${config.badgeBg}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Semester 2</h2>
                  <p className="text-xs text-slate-400">{sem2.length} document{sem2.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {sem2.length > 0 ? (
                <div className="space-y-3">
                  {sem2.map((l) => (
                    <PdfCard key={l.id} lesson={l} accent={config.accent} />
                  ))}
                </div>
              ) : (
                <EmptySection label="semester 2 courses" />
              )}
            </section>
          </div>

          {/* ─── Right: Assignments ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assignments</h2>
                <p className="text-xs text-slate-400">{assignments.length} active</p>
              </div>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((a) => {
                  const isOverdue = a.deadline ? new Date(a.deadline) < new Date() : false;
                  const isNew = new Date().getTime() - new Date(a.created_at).getTime() < 48 * 60 * 60 * 1000;
                  
                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-rose-500 relative transition-transform hover:scale-[1.02]"
                    >
                      {isNew && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-md shadow-sm animate-pulse">
                          New
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 mb-1 pr-8">{a.title}</h4>
                      {a.description && (
                         <p className="text-sm text-slate-600 mb-3 leading-relaxed">{a.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {a.deadline && (
                          <div
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${
                              isOverdue
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {isOverdue ? 'Overdue — ' : 'Due: '}
                            {new Date(a.deadline).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No assignments yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
