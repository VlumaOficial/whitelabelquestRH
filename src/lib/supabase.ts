import { createClient } from "@supabase/supabase-js";

// Validação das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL is required. Please check your .env.local file."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY is required. Please check your .env.local file."
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
