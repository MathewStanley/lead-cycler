import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgsujddraimbgcngubkd.supabase.co';
const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
