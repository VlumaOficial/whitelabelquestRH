-- ============================================
-- DEBUG DASHBOARD - PARTE 1: ESTATÍSTICAS BÁSICAS
-- ============================================

-- 1. VERIFICAR DADOS REAIS NAS TABELAS
-- ============================================

SELECT '=== VERIFICAÇÃO DE DADOS REAIS ===' as info;

-- Candidatos
SELECT 
    'CANDIDATOS' as tabela,
    COUNT(*) as total,
    MIN(created_at) as primeiro_cadastro,
    MAX(created_at) as ultimo_cadastro
FROM candidates;

-- Avaliações
SELECT 
    'AVALIAÇÕES' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completas,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN status = 'started' THEN 1 END) as iniciadas
FROM assessments;

-- Detalhes das avaliações
SELECT 
    id,
    candidate_id,
    status,
    started_at,
    completed_at,
    total_score,
    percentage_score
FROM assessments 
ORDER BY started_at DESC;

-- Respostas das avaliações
SELECT 
    'RESPOSTAS' as tabela,
    COUNT(*) as total_respostas,
    COUNT(DISTINCT assessment_id) as avaliacoes_com_respostas,
    COUNT(DISTINCT subject_id) as materias_respondidas
FROM assessment_answers;

-- ============================================
-- 2. VERIFICAR VIEWS EXISTENTES
-- ============================================

-- Verificar se views existem
SELECT 
    schemaname,
    viewname,
    'EXISTS' as status
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('candidate_summary', 'subject_performance', 'assessment_detailed_report');

-- Testar candidate_summary
SELECT 'CANDIDATE_SUMMARY' as view_name, COUNT(*) as records FROM candidate_summary;

-- Ver dados da candidate_summary
SELECT * FROM candidate_summary LIMIT 5;

-- ============================================
-- 3. DIAGNÓSTICO DO PROBLEMA DE STATUS
-- ============================================

-- Verificar se avaliações têm completed_at mas status errado
SELECT 
    id,
    status,
    started_at,
    completed_at,
    CASE 
        WHEN completed_at IS NOT NULL AND status != 'completed' THEN 'PROBLEMA: Tem completed_at mas status não é completed'
        WHEN completed_at IS NULL AND status = 'completed' THEN 'PROBLEMA: Status completed mas sem completed_at'
        ELSE 'OK'
    END as diagnostico
FROM assessments;

-- ============================================
-- 4. CORRIGIR STATUS DAS AVALIAÇÕES
-- ============================================

-- Atualizar status das avaliações que têm completed_at
UPDATE assessments 
SET status = 'completed'
WHERE completed_at IS NOT NULL 
AND status != 'completed';

-- Verificar quantas foram atualizadas
SELECT 
    'APÓS CORREÇÃO' as momento,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completas,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as em_andamento
FROM assessments;

-- ============================================
-- 5. TESTAR CÁLCULOS DE ESTATÍSTICAS
-- ============================================

-- Cálculo manual das estatísticas
SELECT 
    'ESTATÍSTICAS CORRETAS' as tipo,
    (SELECT COUNT(*) FROM candidates) as total_candidatos,
    (SELECT COUNT(*) FROM assessments) as total_avaliacoes,
    (SELECT COUNT(*) FROM assessments WHERE status = 'completed') as avaliacoes_completas,
    CASE 
        WHEN (SELECT COUNT(*) FROM assessments) > 0 THEN
            ROUND(
                (SELECT COUNT(*) FROM assessments WHERE status = 'completed')::DECIMAL / 
                (SELECT COUNT(*) FROM assessments) * 100, 0
            )
        ELSE 0 
    END as taxa_conclusao_pct;

-- ============================================
-- 6. VERIFICAR MATÉRIAS E RESPOSTAS
-- ============================================

-- Matérias ativas
SELECT 
    'MATÉRIAS ATIVAS' as info,
    COUNT(*) as total
FROM subjects 
WHERE is_active = true;

-- Matérias com respostas
SELECT 
    s.name as materia,
    COUNT(aa.id) as total_respostas,
    AVG(aa.answer_score) as pontuacao_media,
    COUNT(DISTINCT aa.assessment_id) as avaliacoes_diferentes
FROM subjects s
LEFT JOIN assessment_answers aa ON s.id = aa.subject_id
WHERE s.is_active = true
GROUP BY s.id, s.name
ORDER BY s.name;

-- ============================================
-- RESULTADO FINAL
-- ============================================
SELECT '✅ Diagnóstico da Parte 1 concluído!' as status;
