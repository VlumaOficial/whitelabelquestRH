import { defineConfig, loadEnv } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do .env.local e outros arquivos .env
  const env = loadEnv(mode, process.cwd(), '');
  
  // Valores padrão para produção (Vercel)
  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://pnkmjewkbzymrztzutck.supabase.co';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBua21qZXdrYnp5bXJ6dHp1dGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODU4NzIsImV4cCI6MjA3Nzg2MTg3Mn0.q3HjvJnEjS1jgA0cMnjtFBVGb7STMOWZb48PQ3I_kTM';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [dyadComponentTagger(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Garante que as variáveis VITE_ sejam expostas para o cliente
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  };
});
