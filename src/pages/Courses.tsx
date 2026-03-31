import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, BookOpen, Video, FileText } from 'lucide-react';
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

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCourses() {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    }
    getCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modules</h1>
          <p className="text-slate-500 mt-1">Select a module to view lessons and assignments</p>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link 
              to={`/courses/${course.id}`} 
              key={course.id}
              className="group block"
            >
              <div className="card-hover glass-panel rounded-2xl p-6 h-full flex flex-col relative overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-4 rounded-xl border inline-flex", colorMap[course.theme_color || 'blue'])}>
                    <Book className="w-6 h-6" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-2 rounded-full transform group-hover:translate-x-1 duration-300">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 'max-w-[250px]' mb-6 flex-1">
                  {course.description || `Study material for ${course.name}`}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mt-auto pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-1">
                      <BookOpen className={cn("w-4 h-4", iconColorMap[course.theme_color || 'blue'])} />
                      <span>Lessons</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Video className={cn("w-4 h-4", iconColorMap[course.theme_color || 'blue'])} />
                      <span>Videos</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <FileText className={cn("w-4 h-4", iconColorMap[course.theme_color || 'blue'])} />
                      <span>Assignments</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
