import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rgwulxaulonykqzyagkp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnd3VseGF1bG9ueWtxenlhZ2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTUwMDAsImV4cCI6MjA5MDUzMTAwMH0.DlP3SqTCcLgcSsSvEGEOHlvUbhMy13OGWfUW7uuJ5y4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
