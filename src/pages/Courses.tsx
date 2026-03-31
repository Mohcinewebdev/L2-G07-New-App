import { ExternalLink } from 'lucide-react';

// 7 modules with Unsplash images and a sample PDF link
const modules = [
  {
    name: 'Phonetics & Linguistics',
    description: 'Explore the sounds of English and the structures of language.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80',
    color: 'from-green-500/80 to-teal-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    name: 'Reading & Text Analysis',
    description: 'Develop critical reading skills and analytical thinking.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    color: 'from-rose-500/80 to-pink-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    name: 'Written EXP',
    description: 'Master structured academic writing and expression.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
    color: 'from-teal-500/80 to-cyan-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    name: 'Grammar',
    description: 'From verb tenses to complex sentence structures.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    color: 'from-blue-500/80 to-indigo-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    name: 'Study Skills',
    description: 'Techniques and strategies to maximise your academic performance.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    color: 'from-indigo-500/80 to-violet-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    name: 'Literature',
    description: 'Dive into poems, novels, and plays from the English tradition.',
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&q=80',
    color: 'from-purple-500/80 to-fuchsia-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    name: 'Civilization',
    description: 'Discover the history, culture and society of English-speaking nations.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    color: 'from-amber-500/80 to-orange-700/80',
    pdf: 'https://www.africau.edu/images/default/sample.pdf',
  },
];

export default function Courses() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modules</h1>
        <p className="text-slate-500 mt-1">
          Select a module to view its courses and study materials
        </p>
      </div>

      {/* Module Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((mod) => (
          <div
            key={mod.name}
            className="group flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-slate-100"
          >
            {/* Image with gradient overlay */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={mod.image}
                alt={mod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${mod.color}`} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
                  {mod.name}
                </h3>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-col flex-1 p-4 gap-4">
              <p className="text-sm text-slate-500 flex-1 leading-relaxed">
                {mod.description}
              </p>

              {/* Get Courses Button */}
              <a
                href={mod.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Get Courses
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
