import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required in environment variables.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      // 8-second hard timeout on every fetch — prevents silent hangs
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        return fetch(url, { ...options, signal: controller.signal }).finally(() =>
          clearTimeout(timer)
        );
      },
    },
  }
)

