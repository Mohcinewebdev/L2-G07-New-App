import { Calendar, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-primary to-violet-700 overflow-hidden text-white p-10 sm:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Official Student Portal
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
            Welcome to <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">L2 | G07</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-xl font-medium leading-relaxed">
            Access your courses, materials, and track assignments in a unified digital space designed for L2 Group 07.
            By MOHCENE ZIADI
            <br/>
            Academic Year: 2025-2026
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto mt-12">
        {/* Exams & Upcoming */}
        <section className="card-hover glass-panel rounded-[2rem] p-8 sm:p-10 relative overflow-hidden border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Upcoming Exams</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Semester 04</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 relative custom-scrollbar">
            {[
              { module: 'Phonetics & Linguistics', date: 'Sunday, 10 May 2026', time: '2:00 PM', colorClass: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400' },
              { module: 'Literature', date: 'Monday, 11 May 2026', time: '2:00 PM', colorClass: 'bg-rose-50 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400' },
              { module: 'Written Expression', date: 'Tuesday, 12 May 2026', time: '2:00 PM', colorClass: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400' },
              { module: 'Civilization', date: 'Wednesday, 13 May 2026', time: '2:00 PM', colorClass: 'bg-amber-50 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' },
              { module: 'Study Skills', date: 'Thursday, 14 May 2026', time: '2:00 PM', colorClass: 'bg-cyan-50 text-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400' },
              { module: 'Grammar', date: 'Sunday, 17 May 2026', time: '2:00 PM', colorClass: 'bg-violet-50 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400' },
            ].map((exam, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${exam.colorClass} group-hover:scale-110 transition-transform`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{exam.module}</h4>
                    <p className="text-[11px] text-slate-700 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> {exam.date}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex items-center sm:justify-end ml-[3.25rem] sm:ml-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-black border border-slate-100 dark:border-slate-700 uppercase tracking-tighter group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/30 transition-colors">
                    <Clock className="w-3.5 h-3.5" /> {exam.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
