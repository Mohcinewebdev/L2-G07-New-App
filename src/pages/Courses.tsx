import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Each module card definition — slug maps to /module/:slug
const MODULE_CARDS = [
  {
    name: 'Phonetics & Linguistics',
    slug: 'phonetics',
    description: 'Study the sounds of human language, phonemic systems, and the structure of linguistic communication.',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    name: 'Reading & Text Analysis',
    slug: 'reading',
    description: 'Develop critical reading skills to analyse academic and literary texts with confidence.',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80',
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'Written Expression',
    slug: 'written-exp',
    description: 'Master academic writing conventions, essay structure, and expressive written communication.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Grammar',
    slug: 'grammar',
    description: 'Build a solid foundation in English grammar rules, syntax, and correct usage in context.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    gradient: 'from-orange-500 to-amber-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    name: 'Study Skills',
    slug: 'study-skills',
    description: 'Learn effective research, note-taking, time management, and exam preparation techniques.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    gradient: 'from-cyan-500 to-sky-600',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    name: 'Literature',
    slug: 'literature',
    description: 'Explore classic and contemporary works, literary movements, and critical interpretation.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
    gradient: 'from-rose-500 to-pink-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    name: 'Civilization',
    slug: 'civilization',
    description: 'Survey Western and world civilisations, key historical events, and cultural heritage.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
    gradient: 'from-yellow-500 to-amber-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
];

export default function Courses() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Header */}
    {/*  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modules</h1>
          <p className="text-slate-500 mt-1">Select a module to view lessons and assignments</p>
        </div>
      </div> */}

      {/* We removed the legacy DB cards to keep only the beautiful module cards with images */}

      {/* ─── Static module cards ────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Our Modules</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Click <span className="font-semibold text-slate-700">Get Courses</span> to open the module page with semester 1 & 2 materials
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MODULE_CARDS.map((mod) => (
            <div
              key={mod.slug}
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-slate-200">
                <img
                  src={mod.image}
                  alt={mod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${mod.gradient} opacity-50`} />
                <div className="absolute bottom-3 left-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border bg-white/90 ${mod.badge}`}>
                    {mod.name.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">{mod.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 line-clamp-3">{mod.description}</p>

                {/* Get Courses button → navigates to module page */}
                <button
                  onClick={() => navigate(`/module/${mod.slug}`)}
                  className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${mod.gradient} hover:opacity-90 transition-opacity shadow-sm`}
                >
                  Get Courses
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
