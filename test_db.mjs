import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgwulxaulonykqzyagkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnd3VseGF1bG9ueWtxenlhZ2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTUwMDAsImV4cCI6MjA5MDUzMTAwMH0.DlP3SqTCcLgcSsSvEGEOHlvUbhMy13OGWfUW7uuJ5y4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

main();
