import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Edit2, Save, X, Loader2, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string; name: string; email: string; role: string; module?: string } | null>(null);
  
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setNewName(data.name || '');
      }
      setLoading(false);
    }
    getProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile || !newName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName.trim() })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, name: newName.trim() });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20 text-red-500 font-bold">Profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Profile</h1>
          <p className="text-slate-500 mt-1">Manage your identity and account settings</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl text-sm font-bold border border-green-100 animate-in zoom-in">
             <CheckCircle className="w-4 h-4" /> Updated
          </div>
        )}
      </div>

      <div className="glass-panel bg-white/50 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        {/* Header decoration */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-10 -mt-12 relative flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-2xl mb-6">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center text-indigo-600 border border-slate-100">
              <User className="w-10 h-10" />
            </div>
          </div>

          <div className="w-full space-y-6 max-w-md mx-auto">
            {/* Identity section */}
            <div className="group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</span>
                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {editing ? (
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text"
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => { setEditing(false); setNewName(profile.name); }}
                    className="bg-slate-100 text-slate-500 p-2.5 rounded-xl hover:bg-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h3 className="text-2xl font-black text-slate-800">{profile.name || 'Unnamed User'}</h3>
              )}
            </div>

            {/* Email & Role Info */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 text-indigo-500 mb-2">
                     <Mail className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">{profile.email}</p>
               </div>
               <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2 text-indigo-500 mb-2">
                     <Shield className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Role</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 capitalize">{profile.role}</p>
               </div>
            </div>

            {profile.module && (
               <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Module</span>
                    <p className="font-bold text-indigo-900">{profile.module}</p>
                  </div>
                  <Edit2 className="w-5 h-5 text-indigo-200" />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
