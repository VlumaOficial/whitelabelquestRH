# Quest Nos

Projeto React + Vite + TypeScript com Tailwind, shadcn/ui, React Router e TanStack Query. Preparado para Supabase, CI no GitHub Actions e deploy na Vercel como SPA.

## Requisitos

- Node 20
- pnpm 9

## Configuração

1. Instale dependências:

   ```bash
   pnpm install
   ```

2. Crie seu arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

3. Preencha as variáveis (Vite exige prefixo `VITE_`):

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

> As variáveis são tipadas em `src/env.d.ts`. O cliente fica em `src/lib/supabase.ts`.

## Scripts

- Desenvolvimento: `pnpm dev` (http://localhost:8080)
- Lint: `pnpm lint`
- Build: `pnpm build`
- Preview do build: `pnpm preview`

## Supabase

- Cliente central: `src/lib/supabase.ts`
- Acesso às envs: `import.meta.env.VITE_SUPABASE_*`
- Configure regras/policies/tabelas no painel Supabase e use as chaves do projeto (anon key) no `.env.local`.

## Estilos e UI

- Tailwind com `darkMode: "class"`.
- Tokens em `src/globals.css`.
- Componentes shadcn/Radix disponíveis em `src/components/ui/*`.

## Deploy na Vercel

- Build Command: `pnpm build`
- Output Directory: `dist`
- Framework Preset: Vite
- Env Vars no projeto Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- SPA: `vercel.json` já inclui rewrite para `index.html`.

## CI (GitHub Actions)

- Workflow em `.github/workflows/ci.yml`:
  - Instala com pnpm
  - Roda `pnpm lint` e `pnpm build`
  - Executa testes se configurados (`pnpm test`)

## Convenções

- Alias `@` aponta para `src/` (Vite e TSConfig).
- Rotas em `src/App.tsx` (React Router v6).
- Query Client do React Query configurado no App.

## Próximos passos sugeridos

- Adicionar testes (Vitest + React Testing Library).
- Expandir documentação de componentes e padrões de dados.
