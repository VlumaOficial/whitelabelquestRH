-- ============================================
-- DESCOBRIR ESTRUTURA REAL DO BANCO
-- Execute estas consultas para mapear as tabelas existentes
-- ============================================

-- 1. LISTAR TODAS AS TABELAS EXISTENTES
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- 2. DESCOBRIR ESTRUTURA DA TABELA CANDIDATES (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'candidates' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. DESCOBRIR ESTRUTURA DA TABELA PROFILES (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. DESCOBRIR ESTRUTURA DA TABELA ADMIN_USERS (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. DESCOBRIR ESTRUTURA DA TABELA AUTH.USERS
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 6. VERIFICAR USUÁRIOS DO SUPABASE AUTH (SEMPRE FUNCIONA)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 7. TENTAR DESCOBRIR DADOS NA TABELA CANDIDATES (SEGURO)
-- Esta consulta vai mostrar erro se a tabela não existir, mas é seguro
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidates') THEN
        RAISE NOTICE 'Tabela candidates existe!';
        -- Vamos descobrir as colunas primeiro
    ELSE
        RAISE NOTICE 'Tabela candidates NÃO existe!';
    END IF;
END $$;

-- 8. CONSULTA SEGURA PARA CANDIDATES (ajuste conforme as colunas encontradas)
-- Execute APENAS depois de descobrir as colunas na consulta 2
/*
SELECT * FROM candidates LIMIT 5;
*/

-- 9. VERIFICAR SE EXISTEM OUTRAS TABELAS RELACIONADAS
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name LIKE '%candidate%'
ORDER BY table_name;

-- 10. VERIFICAR TABELAS COM NOMES SIMILARES
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%user%' OR
    table_name LIKE '%profile%' OR
    table_name LIKE '%admin%' OR
    table_name LIKE '%candidate%' OR
    table_name LIKE '%question%' OR
    table_name LIKE '%response%'
  )
ORDER BY table_name;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
/*
1. Execute a consulta 1 primeiro para ver todas as tabelas
2. Execute a consulta 6 para ver usuários do Supabase (sempre funciona)
3. Execute as consultas 2-5 para descobrir estrutura das tabelas
4. Use os resultados para ajustar as próximas consultas
5. Execute a consulta 10 para ver todas as tabelas relacionadas

EXEMPLO DE RESULTADO ESPERADO:
- Se candidates tem colunas: id, full_name, email_address
- Então use: SELECT id, full_name, email_address FROM candidates;
*/
