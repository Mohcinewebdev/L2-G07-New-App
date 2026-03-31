import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, GraduationCap } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTeachers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'teacher')
        .order('name');
        
      if (!error && data) {
        setTeachers(data);
      }
      setLoading(false);
    }
    getTeachers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Our Teachers</h1>
        <p className="text-slate-500 mt-1">Meet the dedicated faculty members of L2 | G07</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div 
              key={teacher.id}
              className="card-hover glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden bg-white/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full 'bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{teacher.name || 'Unnamed Teacher'}</h3>
                  <p className="text-sm font-medium text-primary flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" /> Faculty
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <a 
                  href={`mailto:${teacher.email}`}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <Mail className="w-4 h-4" />
                  {teacher.email}
                </a>
              </div>
            </div>
          ))}
          {teachers.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl">
              No teachers registered yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
