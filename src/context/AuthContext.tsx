import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  role: string;
  name: string;
  module: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: string | null;
  isTeacher: boolean;
  loading: boolean;
  userName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  isTeacher: false,
  loading: true,
  userName: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Build an immediate profile from user_metadata (available instantly, no DB call)
  const getMetaProfile = (userMeta?: Record<string, any>): Profile => ({
    role: userMeta?.role || 'student',
    name: userMeta?.full_name || '',
    module: userMeta?.module || '',
  });

  // Fetch profile from DB (runs in background, doesn't block rendering)
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, module')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          role: data.role || 'student',
          name: data.name || '',
          module: data.module || '',
        });
      }
    } catch {
      // Profile fetch failed — keep the metadata-based profile
    }
  };

  useEffect(() => {
    // Get initial session
    const init = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // Set profile immediately from metadata so pages can render right away
      if (currentSession?.user) {
        setProfile(getMetaProfile(currentSession.user.user_metadata));
      }

      // CRITICAL: stop loading immediately — don't wait for DB profile fetch
      setLoading(false);

      // Then fetch the full profile from DB in the background
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
    };

    init();

    // Listen for auth changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        // Immediately set profile from metadata
        setProfile(getMetaProfile(newSession.user.user_metadata));
        // Then refine with DB data in background
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const user = session?.user ?? null;
  const role = profile?.role ?? null;
  const isTeacher = role === 'teacher';
  const userName = profile?.name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || null;

  return (
    <AuthContext.Provider value={{ session, user, profile, role, isTeacher, loading, userName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
