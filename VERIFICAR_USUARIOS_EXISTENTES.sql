-- ============================================
-- VERIFICAR USUÁRIOS EXISTENTES NO BANCO
-- Execute estas consultas no Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR USUÁRIOS NA TABELA AUTH (Supabase Auth)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data,
    is_super_admin
FROM auth.users 
ORDER BY created_at DESC;

-- 2. VERIFICAR PROFILES (se existir)
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. VERIFICAR ADMIN_USERS (se existir)
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at,
    last_login
FROM admin_users 
ORDER BY created_at DESC;

-- 4. VERIFICAR CANDIDATES (candidatos do sistema anterior)
SELECT 
    id,
    name,
    email,
    phone,
    area_of_expertise,
    years_of_experience,
    created_at
FROM candidates 
ORDER BY created_at DESC
LIMIT 10;

-- 5. VERIFICAR QUESTIONNAIRES (questionários existentes)
SELECT 
    id,
    title,
    description,
    is_active,
    created_at,
    updated_at
FROM questionnaires 
ORDER BY created_at DESC
LIMIT 5;

-- 6. VERIFICAR QUESTIONS (perguntas existentes)
SELECT 
    q.id,
    q.question_text,
    q.question_type,
    qn.title as questionnaire_title,
    q.created_at
FROM questions q
LEFT JOIN questionnaires qn ON q.questionnaire_id = qn.id
ORDER BY q.created_at DESC
LIMIT 10;

-- 7. VERIFICAR RESPONSES (respostas dos candidatos)
SELECT 
    r.id,
    c.name as candidate_name,
    c.email as candidate_email,
    q.question_text,
    r.response_text,
    r.created_at
FROM responses r
JOIN candidates c ON r.candidate_id = c.id
JOIN questions q ON r.question_id = q.id
ORDER BY r.created_at DESC
LIMIT 10;

-- 8. VERIFICAR PERSONAL_PRESENTATIONS (apresentações pessoais)
SELECT 
    pp.id,
    c.name as candidate_name,
    c.email as candidate_email,
    pp.video_url,
    pp.created_at
FROM personal_presentations pp
JOIN candidates c ON pp.candidate_id = c.id
ORDER BY pp.created_at DESC
LIMIT 5;

-- 9. VERIFICAR BRANDING_CONFIG (configurações de branding)
SELECT 
    id,
    company_name,
    tagline,
    description,
    logo_url,
    primary_color,
    secondary_color,
    accent_color,
    created_at,
    updated_at
FROM branding_config 
ORDER BY created_at DESC;

-- 10. CONTAR REGISTROS POR TABELA
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total_registros
FROM auth.users
UNION ALL
SELECT 
    'profiles' as tabela,
    COUNT(*) as total_registros
FROM profiles
UNION ALL
SELECT 
    'admin_users' as tabela,
    COUNT(*) as total_registros
FROM admin_users
UNION ALL
SELECT 
    'candidates' as tabela,
    COUNT(*) as total_registros
FROM candidates
UNION ALL
SELECT 
    'questionnaires' as tabela,
    COUNT(*) as total_registros
FROM questionnaires
UNION ALL
SELECT 
    'questions' as tabela,
    COUNT(*) as total_registros
FROM questions
UNION ALL
SELECT 
    'responses' as tabela,
    COUNT(*) as total_registros
FROM responses
UNION ALL
SELECT 
    'personal_presentations' as tabela,
    COUNT(*) as total_registros
FROM personal_presentations
UNION ALL
SELECT 
    'branding_config' as tabela,
    COUNT(*) as total_registros
FROM branding_config;

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute cada consulta separadamente
-- 2. Anote os emails e IDs encontrados
-- 3. Se alguma tabela não existir, ignore o erro
-- 4. Foque nas tabelas com dados (auth.users, profiles, candidates)
-- 5. Use os resultados para identificar usuários existentes
