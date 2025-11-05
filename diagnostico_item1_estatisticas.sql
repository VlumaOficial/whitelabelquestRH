-- ============================================
-- DIAGNÓSTICO ITEM 1: ESTATÍSTICAS BÁSICAS
-- ============================================
-- OBJETIVO: Entender por que Taxa de Conclusão = 0% e Avaliações Completas = 0
-- quando existem 2 avaliações realizadas

SELECT '=== DIAGNÓSTICO ITEM 1: ESTATÍSTICAS BÁSICAS ===' as titulo;

-- ============================================
-- 1. VERIFICAR DADOS REAIS DAS AVALIAÇÕES
-- ============================================

SELECT '--- 1. DADOS REAIS DAS AVALIAÇÕES ---' as secao;

-- Ver todas as avaliações com detalhes completos
SELECT 
    id,
    candidate_id,
    status,
    started_at,
    completed_at,
    total_score,
    percentage_score,
    time_spent_minutes,
    created_at,
    updated_at
FROM assessments 
ORDER BY created_at DESC;

-- ============================================
-- 2. ANÁLISE DO STATUS
-- ============================================

SELECT '--- 2. ANÁLISE DO STATUS ---' as secao;

-- Contar por status
SELECT 
    status,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as com_completed_at,
    COUNT(CASE WHEN completed_at IS NULL THEN 1 END) as sem_completed_at
FROM assessments 
GROUP BY status
ORDER BY status;

-- ============================================
-- 3. LÓGICA ATUAL DO DASHBOARD
-- ============================================

SELECT '--- 3. LÓGICA ATUAL DO DASHBOARD ---' as secao;

-- Simular exatamente o que o dashboard está calculando
SELECT 
    'SIMULAÇÃO DASHBOARD' as tipo,
    (SELECT COUNT(*) FROM candidates) as total_candidatos,
    (SELECT COUNT(*) FROM assessments) as total_avaliacoes,
    (SELECT COUNT(*) FROM assessments WHERE status = 'completed') as completas_por_status,
    (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL) as completas_por_completed_at,
    CASE 
        WHEN (SELECT COUNT(*) FROM assessments) > 0 THEN
            ROUND(
                (SELECT COUNT(*) FROM assessments WHERE status = 'completed')::DECIMAL / 
                (SELECT COUNT(*) FROM assessments) * 100, 0
            )
        ELSE 0 
    END as taxa_por_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM assessments) > 0 THEN
            ROUND(
                (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL)::DECIMAL / 
                (SELECT COUNT(*) FROM assessments) * 100, 0
            )
        ELSE 0 
    END as taxa_por_completed_at;

-- ============================================
-- 4. VERIFICAR RESPOSTAS DAS AVALIAÇÕES
-- ============================================

SELECT '--- 4. RESPOSTAS DAS AVALIAÇÕES ---' as secao;

-- Ver se as avaliações têm respostas (indicativo de conclusão)
SELECT 
    a.id as assessment_id,
    a.status,
    a.completed_at,
    COUNT(aa.id) as total_respostas,
    MIN(aa.created_at) as primeira_resposta,
    MAX(aa.created_at) as ultima_resposta
FROM assessments a
LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
GROUP BY a.id, a.status, a.completed_at
ORDER BY a.created_at DESC;

-- ============================================
-- 5. DIAGNÓSTICO FINAL
-- ============================================

SELECT '--- 5. DIAGNÓSTICO FINAL ---' as secao;

-- Identificar o problema específico
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL) = 0 THEN
            '❌ PROBLEMA: Nenhuma avaliação tem completed_at preenchido'
        WHEN (SELECT COUNT(*) FROM assessments WHERE status = 'completed') = 0 AND 
             (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL) > 0 THEN
            '⚠️ PROBLEMA: Avaliações têm completed_at mas status não é "completed"'
        WHEN (SELECT COUNT(*) FROM assessment_answers) = 0 THEN
            '❌ PROBLEMA: Não há respostas salvas nas avaliações'
        ELSE
            '✅ Dados parecem corretos - problema pode ser na lógica do dashboard'
    END as diagnostico,
    
    (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL) as avaliacoes_com_completed_at,
    (SELECT COUNT(*) FROM assessments WHERE status = 'completed') as avaliacoes_status_completed,
    (SELECT COUNT(*) FROM assessment_answers) as total_respostas_salvas;

-- ============================================
-- RESULTADO
-- ============================================
SELECT '✅ Diagnóstico do Item 1 concluído!' as resultado;
