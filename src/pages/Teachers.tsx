import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, GraduationCap, BookOpen, User } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  module: string | null;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTeachers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, module')
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-3xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div 
              key={teacher.id}
              className="group bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Card Header Decoration */}
              <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>

              {/* Avatar section */}
              <div className="px-6 pb-6 flex flex-col flex-1 -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg mb-4">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 flex items-center justify-center text-indigo-600 text-2xl font-bold border border-slate-100">
                    {teacher.name ? teacher.name.charAt(0).toUpperCase() : <User className="w-8 h-8 opacity-40" />}
                  </div>
                </div>

                {/* Info section */}
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                    {teacher.name || 'Unnamed Teacher'}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-indigo-600 mb-4">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Faculty</span>
                  </div>

                  {teacher.module && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 mb-6">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium">{teacher.module}</span>
                    </div>
                  )}
                </div>

                {/* Contact section */}
                <div className="pt-4 border-t border-slate-50">
                  <a 
                    href={`mailto:${teacher.email}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-500/20"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Now
                  </a>
                  <p className="mt-2 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">{teacher.email}</p>
                </div>
              </div>
            </div>
          ))}
          
          {teachers.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-lg">No teachers registered yet.</p>
              <p className="text-slate-400 text-sm mt-1">New faculty members will appear here once they join.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
