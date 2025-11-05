# 🗄️ Configuração do Banco de Dados - Quest Nós

## 📋 Pré-requisitos
1. Conta no Supabase criada
2. Projeto no Supabase configurado
3. Acesso ao SQL Editor do Supabase

## 🚀 Passo a Passo

### 1️⃣ **Acessar o Supabase Dashboard**
- Acesse: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione seu projeto "Quest Nos"

### 2️⃣ **Obter Credenciais do Projeto**
- No dashboard, vá em **Settings** → **API**
- Copie a **Project URL**
- Copie a **anon public key**
- Cole essas informações no arquivo `.env.local`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 3️⃣ **Executar Scripts no SQL Editor**

#### A) Abrir o SQL Editor
- No dashboard do Supabase, clique em **SQL Editor**
- Clique em **New Query**

#### B) Executar Verificação Inicial
Cole e execute este comando primeiro:
```sql
-- Verificar se as tabelas já existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('candidates', 'assessments', 'assessment_answers', 'subjects', 'admin_users');
```

#### C) Criar Estrutura do Banco
Se não existir nenhuma tabela, execute o arquivo `database_setup.sql` **em partes**:

**Parte 1 - Criar Tabelas:**
```sql
-- Execute as seções de CREATE TABLE uma por vez
-- (copie do arquivo database_setup.sql)
```

**Parte 2 - Criar Índices:**
```sql
-- Execute os comandos CREATE INDEX
-- (copie do arquivo database_setup.sql)
```

**Parte 3 - Inserir Dados Iniciais:**
```sql
-- Execute os INSERTs das matérias
-- (copie do arquivo database_setup.sql)
```

### 4️⃣ **Verificar se Tudo Foi Criado**

Execute estes comandos para verificar:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar matérias inseridas
SELECT id, name, weight FROM subjects ORDER BY name;

-- 3. Verificar views criadas
SELECT table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public';
```

### 5️⃣ **Configurar Autenticação (Opcional)**

Se quiser habilitar autenticação:
- Vá em **Authentication** → **Settings**
- Configure os provedores desejados (Email, Google, etc.)

### 6️⃣ **Testar Conexão**

Depois de configurar o `.env.local`, execute no terminal:

```bash
pnpm run dev
```

Abra o console do navegador e teste:
```javascript
// No console do navegador
import { supabase } from './src/lib/supabase.ts'
const { data, error } = await supabase.from('subjects').select('*')
console.log('Matérias:', data)
```

## 🔍 Comandos de Diagnóstico

### Verificar Estrutura de uma Tabela:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'candidates'
ORDER BY ordinal_position;
```

### Verificar Políticas RLS:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';
```

### Contar Registros:
```sql
SELECT 
  'candidates' as table_name, COUNT(*) as total FROM candidates
UNION ALL
SELECT 
  'subjects' as table_name, COUNT(*) as total FROM subjects
UNION ALL
SELECT 
  'assessments' as table_name, COUNT(*) as total FROM assessments;
```

## 🚨 Solução de Problemas

### Erro de Permissão:
- Verifique se você é o owner do projeto
- Desative temporariamente RLS se necessário:
```sql
ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;
```

### Erro de Conexão:
- Verifique se as credenciais estão corretas no `.env.local`
- Verifique se o arquivo está na raiz do projeto
- Reinicie o servidor de desenvolvimento

### Tabelas não Aparecem:
- Execute os comandos CREATE TABLE um por vez
- Verifique se não há erros de sintaxe
- Refresh a página do Supabase

## 📊 Estrutura Final Esperada

Após a configuração, você deve ter:
- ✅ 5 tabelas principais
- ✅ 8 matérias de avaliação
- ✅ 3 views para relatórios
- ✅ Índices para performance
- ✅ Políticas RLS configuradas
- ✅ Função de cálculo de score

## 🎯 Próximos Passos

Depois que o banco estiver configurado:
1. Testar salvamento de candidatos
2. Implementar dashboard administrativo
3. Criar relatórios de avaliação
4. Configurar backup automático
