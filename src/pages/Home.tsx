import { Calendar, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-primary to-indigo-600 overflow-hidden text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Welcome to L2 | G07
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-xl">
            The official portal for second-year English department students, Group 07. 
            Access your courses, materials, and track assignments all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Weekly Schedule */}
        <section className="card-hover glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Weekly Schedule</h2>
          </div>
          
          <div className="space-y-4">
            {/* Example Schedule. This can be made dynamic from Supabase later */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-slate-500 text-sm font-medium mb-1">Sunday</p>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm mb-2">
                <span className="font-semibold text-slate-700">08:00 - 09:30</span>
                <span className="text-primary font-medium">Civilization</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="font-semibold text-slate-700">09:45 - 11:15</span>
                <span className="text-primary font-medium">Grammar</span>
              </div>
            </div>
          </div>
        </section>

        {/* Exams & Upcoming */}
        <section className="card-hover glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Upcoming Exams</h2>
          </div>

          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl rounded-xl border border-slate-100 border-dashed">
             <FileText className="w-12 h-12 text-slate-300 mb-3" />
             <p className="text-slate-500 font-medium">No exams scheduled currently.</p>
             <p className="text-sm text-slate-400">Enjoy your free time!</p>
          </div>
        </section>
      </div>
    </div>
  );
}
