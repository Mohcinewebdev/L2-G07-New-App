import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, BookOpen, Video, FileText, FileDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface Course {
  id: string;
  name: string;
  description: string;
  theme_color: string;
}

const colorMap: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
  teal: 'bg-teal-50 text-teal-600 border-teal-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

const iconColorMap: Record<string, string> = {
  amber: 'text-amber-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  green: 'text-green-500',
  rose: 'text-rose-500',
  teal: 'text-teal-500',
  indigo: 'text-indigo-500',
};

// ─── Static module definitions ────────────────────────────────────────────────
const MODULE_CARDS = [
  {
    name: 'Phonetics & Linguistics',
    slug: 'phonetics',
    description: 'Study the sounds of human language, phonemic systems, and the structure of linguistic communication.',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80',
    accent: 'from-violet-500 to-purple-600',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    name: 'Reading & Text Analysis',
    slug: 'reading',
    description: 'Develop critical reading skills to analyse academic and literary texts with confidence.',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80',
    accent: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'Written Expression',
    slug: 'written-exp',
    description: 'Master academic writing conventions, essay structure, and expressive written communication.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
    accent: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Grammar',
    slug: 'grammar',
    description: 'Build a solid foundation in English grammar rules, syntax, and correct usage in context.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    accent: 'from-orange-500 to-amber-600',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    name: 'Study Skills',
    slug: 'study-skills',
    description: 'Learn effective research, note-taking, time management, and exam preparation techniques.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    accent: 'from-cyan-500 to-sky-600',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    name: 'Literature',
    slug: 'literature',
    description: 'Explore classic and contemporary works, literary movements, and critical interpretation.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
    accent: 'from-rose-500 to-pink-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    name: 'Civilization',
    slug: 'civilization',
    description: 'Survey Western and world civilisations, key historical events, and cultural heritage.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
    accent: 'from-yellow-500 to-amber-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCourses() {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (!error && data) setCourses(data);
      setLoading(false);
    }
    getCourses();
  }, []);

  return (
    <div className="space-y-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modules</h1>
          <p className="text-slate-500 mt-1">Select a module to view lessons and assignments</p>
        </div>
      </div>

      {/* ─── DB-driven course cards ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link to={`/courses/${course.id}`} key={course.id} className="group block">
              <div className="card-hover glass-panel rounded-2xl p-6 h-full flex flex-col relative overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('p-4 rounded-xl border inline-flex', colorMap[course.theme_color || 'blue'])}>
                    <Book className="w-6 h-6" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-2 rounded-full">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
                  {course.description || `Study material for ${course.name}`}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1">
                    <BookOpen className={cn('w-4 h-4', iconColorMap[course.theme_color || 'blue'])} />
                    <span>Lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className={cn('w-4 h-4', iconColorMap[course.theme_color || 'blue'])} />
                    <span>Videos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className={cn('w-4 h-4', iconColorMap[course.theme_color || 'blue'])} />
                    <span>Assignments</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* ─── Static module cards ────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Our Modules</h2>
        <p className="text-slate-500 mb-8">Browse all available course materials for each module</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MODULE_CARDS.map((mod) => (
            <div
              key={mod.slug}
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Card image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={mod.image}
                  alt={mod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback gradient if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${mod.accent} opacity-60`} />
                {/* Module badge */}
                <div className="absolute bottom-3 left-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border bg-white/90 ${mod.badge}`}>
                    {mod.name.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">{mod.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 line-clamp-3">
                  {mod.description}
                </p>

                {/* Get Courses button */}
                <a
                  href={`/${mod.slug}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${mod.accent} hover:opacity-90 transition-opacity shadow-sm`}
                >
                  <FileDown className="w-4 h-4" />
                  Get Courses
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
