-- ============================================
-- CORREÇÃO DO DASHBOARD - VIEWS E DADOS
-- ============================================

-- 1. RECRIAR VIEWS NECESSÁRIAS PARA O DASHBOARD
-- ============================================

-- View: Resumo de Candidatos (corrigida)
DROP VIEW IF EXISTS candidate_summary CASCADE;
CREATE OR REPLACE VIEW candidate_summary AS
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.education_level,
    c.experience_years,
    c.created_at as registration_date,
    COALESCE(COUNT(a.id), 0) as total_assessments,
    COALESCE(COUNT(CASE WHEN a.status = 'completed' THEN 1 END), 0) as completed_assessments,
    COALESCE(AVG(CASE WHEN a.status = 'completed' THEN a.percentage_score END), 0) as avg_score,
    MAX(a.completed_at) as last_assessment_date
FROM candidates c
LEFT JOIN assessments a ON c.id = a.candidate_id
GROUP BY c.id, c.full_name, c.email, c.phone, c.education_level, c.experience_years, c.created_at
ORDER BY c.created_at DESC;

-- View: Desempenho por Matéria (corrigida)
DROP VIEW IF EXISTS subject_performance CASCADE;
CREATE OR REPLACE VIEW subject_performance AS
SELECT 
    s.id as subject_id,
    s.name as subject_name,
    s.description as subject_description,
    s.weight as subject_weight,
    COALESCE(COUNT(aa.id), 0) as total_answers,
    COALESCE(AVG(aa.answer_score), 0) as avg_score,
    COALESCE(COUNT(CASE WHEN aa.is_correct = true THEN 1 END), 0) as correct_answers,
    CASE 
        WHEN COUNT(aa.id) > 0 THEN
            ROUND((COUNT(CASE WHEN aa.is_correct = true THEN 1 END)::DECIMAL / COUNT(aa.id)) * 100, 2)
        ELSE 0 
    END as success_rate_percentage
FROM subjects s
LEFT JOIN assessment_answers aa ON s.id = aa.subject_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.description, s.weight
ORDER BY s.name;

-- View: Relatório Detalhado de Avaliação (corrigida)
DROP VIEW IF EXISTS assessment_detailed_report CASCADE;
CREATE OR REPLACE VIEW assessment_detailed_report AS
SELECT 
    a.id as assessment_id,
    c.full_name as candidate_name,
    c.email as candidate_email,
    a.status,
    a.started_at,
    a.completed_at,
    COALESCE(a.total_score, 0) as total_score,
    COALESCE(a.percentage_score, 0) as percentage_score,
    COALESCE(a.time_spent_minutes, 0) as time_spent_minutes,
    COALESCE(COUNT(aa.id), 0) as total_questions_answered,
    COALESCE(COUNT(CASE WHEN aa.is_correct = true THEN 1 END), 0) as correct_answers,
    CASE 
        WHEN COUNT(aa.id) > 0 THEN
            ROUND((COUNT(CASE WHEN aa.is_correct = true THEN 1 END)::DECIMAL / COUNT(aa.id)) * 100, 2)
        ELSE 0 
    END as accuracy_percentage
FROM assessments a
JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
GROUP BY a.id, c.full_name, c.email, a.status, a.started_at, a.completed_at, 
         a.total_score, a.percentage_score, a.time_spent_minutes
ORDER BY a.started_at DESC;

-- ============================================
-- 2. INSERIR DADOS DE EXEMPLO (SE NECESSÁRIO)
-- ============================================

-- Verificar se há dados nas tabelas principais
DO $$
DECLARE
    candidate_count INTEGER;
    subject_count INTEGER;
BEGIN
    -- Contar candidatos
    SELECT COUNT(*) INTO candidate_count FROM candidates;
    
    -- Contar matérias ativas
    SELECT COUNT(*) INTO subject_count FROM subjects WHERE is_active = true;
    
    -- Se não há matérias, criar algumas básicas
    IF subject_count = 0 THEN
        INSERT INTO subjects (name, description, weight, is_active) VALUES
        ('Criatividade', 'Habilidades criativas e inovação', 1.0, true),
        ('Comunicação', 'Habilidades de comunicação e expressão', 1.0, true),
        ('Tecnologia', 'Conhecimentos técnicos e digitais', 1.0, true),
        ('Marketing', 'Estratégias e conhecimentos de marketing', 1.0, true),
        ('Análise', 'Capacidade analítica e resolução de problemas', 1.0, true)
        ON CONFLICT (name) DO NOTHING;
        
        RAISE NOTICE 'Matérias básicas inseridas: %', subject_count;
    END IF;
    
    -- Se não há candidatos, criar um exemplo
    IF candidate_count = 0 THEN
        INSERT INTO candidates (
            email, 
            full_name, 
            phone, 
            education_level, 
            experience_years,
            consent_data_processing,
            consent_marketing
        ) VALUES (
            'exemplo@teste.com',
            'Candidato de Exemplo',
            '(11) 99999-9999',
            'Superior Completo',
            5,
            true,
            false
        ) ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Candidato de exemplo criado';
    END IF;
    
    RAISE NOTICE 'Verificação concluída - Candidatos: %, Matérias: %', candidate_count, subject_count;
END $$;

-- ============================================
-- 3. VERIFICAR SE AS VIEWS FORAM CRIADAS
-- ============================================

-- Listar views criadas
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('candidate_summary', 'subject_performance', 'assessment_detailed_report');

-- ============================================
-- 4. TESTAR AS VIEWS
-- ============================================

-- Testar candidate_summary
SELECT 'candidate_summary' as view_name, COUNT(*) as record_count FROM candidate_summary
UNION ALL
-- Testar subject_performance  
SELECT 'subject_performance' as view_name, COUNT(*) as record_count FROM subject_performance
UNION ALL
-- Testar assessment_detailed_report
SELECT 'assessment_detailed_report' as view_name, COUNT(*) as record_count FROM assessment_detailed_report;

-- ============================================
-- 5. ESTATÍSTICAS BÁSICAS PARA DASHBOARD
-- ============================================

-- Resumo geral do sistema
SELECT 
    'RESUMO GERAL' as categoria,
    (SELECT COUNT(*) FROM candidates) as total_candidatos,
    (SELECT COUNT(*) FROM assessments) as total_avaliacoes,
    (SELECT COUNT(*) FROM assessments WHERE status = 'completed') as avaliacoes_completas,
    (SELECT COUNT(*) FROM subjects WHERE is_active = true) as materias_ativas;

-- Top 5 matérias por performance
SELECT 
    'TOP MATÉRIAS' as info,
    subject_name,
    total_answers,
    success_rate_percentage
FROM subject_performance 
WHERE total_answers > 0
ORDER BY success_rate_percentage DESC 
LIMIT 5;

-- Candidatos recentes
SELECT 
    'CANDIDATOS RECENTES' as info,
    full_name,
    email,
    registration_date,
    total_assessments
FROM candidate_summary 
ORDER BY registration_date DESC 
LIMIT 5;

-- ============================================
-- COMANDO FINAL
-- ============================================
SELECT '✅ Dashboard corrigido e views atualizadas!' as status;
