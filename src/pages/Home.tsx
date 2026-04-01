import { useEffect, useState } from 'react';
import { Calendar, FileText, ArrowRight, Clock, BookOpen, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface RecentAssignment {
  id: string;
  title: string;
  module: string;
  deadline: string;
  created_at: string;
}

const MODULE_MAP: Record<string, string> = {
  'Phonetics & Linguistics': 'phonetics',
  'Reading & Text Analysis': 'reading',
  'Written Expression': 'written-exp',
  'Grammar': 'grammar',
  'Study Skills': 'study-skills',
  'Literature': 'literature',
  'Civilization': 'civilization',
};

export default function Home() {
  const [assignments, setAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentAssignments() {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, module, deadline, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setAssignments(data);
      }
      setLoading(false);
    }
    fetchRecentAssignments();
  }, []);

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
            Welcome to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">L2 | G07</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-xl font-medium leading-relaxed">
            Access your courses, materials, and track assignments in a unified digital space designed for Group 07.
            Developed and Designed By MOHCENE ZIADI
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Assignments Section */}
        <section className="card-hover glass-panel rounded-[2rem] p-8 sm:p-10 relative overflow-hidden bg-white/40 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Assignments</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Latest updates</p>
              </div>
            </div>
            <Link to="/courses" className="text-primary hover:underline text-sm font-bold flex items-center gap-1 group">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="h-24 rounded-2xl bg-slate-100/50 animate-pulse border border-slate-100" />
               ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Combine real assignments and placeholders to always show 3 slots */}
              {[...assignments, ...Array(Math.max(0, 3 - assignments.length)).fill(null)].slice(0, 3).map((asg, i) => {
                const cardContent = (
                  <div key={asg?.id || `placeholder-${i}`} className={`p-5 rounded-2xl border border-slate-100 bg-white transition-all relative overflow-hidden ${asg ? 'hover:border-indigo-200 hover:shadow-lg cursor-pointer group' : 'opacity-50'}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${asg ? 'bg-indigo-500 group-hover:w-2' : 'bg-slate-200'} transition-all`} />
                    <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className={`font-bold text-lg mb-1 ${asg ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-400'}`}>
                            {asg ? asg.title : 'Recently added module'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                            <BookOpen className={`w-3.5 h-3.5 ${asg ? 'text-indigo-400' : 'text-slate-200'}`} />
                            {asg ? asg.module : 'Stay tuned for updates'}
                          </div>
                        </div>
                        {asg && asg.deadline && (
                          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black border border-slate-100 uppercase tracking-tighter">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(asg.deadline).toLocaleDateString()}
                          </div>
                        )}
                        {!asg && (
                          <div className="shrink-0 text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                            Coming soon
                          </div>
                        )}
                    </div>
                  </div>
                );

                if (asg && MODULE_MAP[asg.module]) {
                  return (
                    <Link key={asg.id} to={`/module/${MODULE_MAP[asg.module]}`} className="block">
                      {cardContent}
                    </Link>
                  );
                }

                return cardContent;
              })}
            </div>
          )}
        </section>

        {/* Exams & Upcoming */}
        <section className="card-hover glass-panel rounded-[2rem] p-8 sm:p-10 relative overflow-hidden border border-slate-100 bg-white/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Upcoming Exams</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Deadlines & Tests</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-3xl border border-2 border-dashed border-slate-100">
             <Calendar className="w-12 h-12 text-slate-200 mb-3" />
             <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No exams scheduled</p>
             <p className="text-[10px] text-slate-400 mt-1">Check back later for mid-term schedule.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
