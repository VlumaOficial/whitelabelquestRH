# Setup de Desenvolvimento - Quest Nos

## Comandos para Configurar o Ambiente

### 1. Habilitar execução de scripts no PowerShell (se necessário)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Instalar dependências principais
```bash
pnpm add @supabase/supabase-js
```

### 3. Instalar dependências de desenvolvimento/testes
```bash
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### 4. Configurar ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local com suas credenciais do Supabase:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 5. Executar aplicação
```bash
pnpm dev
```

## Estrutura Criada

### Arquivos de Configuração
- `.nvmrc` - Versão do Node (20)
- `vitest.config.ts` - Configuração de testes
- `src/env.d.ts` - Tipagem das variáveis de ambiente
- `.github/workflows/ci.yml` - Pipeline de CI

### Utilitários Supabase
- `src/lib/supabase.ts` - Cliente Supabase centralizado
- `src/hooks/useSupabase.ts` - Hooks para queries, insert, update

### Componentes de UI
- `src/components/ui/loading.tsx` - Componente de loading
- `src/components/ui/error-boundary.tsx` - Error boundary para capturar erros

### Testes
- `src/test/setup.ts` - Configuração global dos testes
- `src/test/App.test.tsx` - Teste de exemplo

## Scripts Disponíveis

- `pnpm dev` - Servidor de desenvolvimento
- `pnpm build` - Build de produção
- `pnpm test` - Executar testes em modo watch
- `pnpm test:run` - Executar testes uma vez
- `pnpm test:ui` - Interface visual dos testes
- `pnpm lint` - Verificar código

## Próximos Passos

1. Execute os comandos de instalação acima
2. Configure suas credenciais do Supabase no `.env.local`
3. Execute `pnpm dev` para iniciar o desenvolvimento
4. Acesse http://localhost:8080

## Notas Importantes

- Todas as variáveis de ambiente devem ter prefixo `VITE_` para serem acessíveis no frontend
- O cliente Supabase está configurado em `src/lib/supabase.ts`
- Hooks utilitários estão em `src/hooks/useSupabase.ts`
- Componentes de UI adicionais estão em `src/components/ui/`
