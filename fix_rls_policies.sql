-- ============================================
-- CORREÇÃO DAS POLÍTICAS RLS - Quest Nós
-- Execute este comando no SQL Editor do Supabase
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA TESTES
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS EXISTENTES (se houver)
DROP POLICY IF EXISTS "Candidates can view own data" ON candidates;
DROP POLICY IF EXISTS "Admins can view all data" ON candidates;

-- 3. CRIAR POLÍTICAS MAIS PERMISSIVAS PARA DESENVOLVIMENTO

-- Política para permitir inserção de candidatos (público)
CREATE POLICY "Allow public candidate creation" ON candidates
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de candidatos (público)
CREATE POLICY "Allow public candidate read" ON candidates
    FOR SELECT USING (true);

-- Política para permitir inserção de avaliações (público)
CREATE POLICY "Allow public assessment creation" ON assessments
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de avaliações (público)
CREATE POLICY "Allow public assessment read" ON assessments
    FOR SELECT USING (true);

-- Política para permitir inserção de respostas (público)
CREATE POLICY "Allow public answers creation" ON assessment_answers
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de respostas (público)
CREATE POLICY "Allow public answers read" ON assessment_answers
    FOR SELECT USING (true);

-- 4. REABILITAR RLS COM NOVAS POLÍTICAS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
