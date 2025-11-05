-- ============================================
-- DIAGNÓSTICO: ESTRUTURA DE COMPETÊNCIAS
-- ============================================
-- OBJETIVO: Entender a estrutura real do questionário de autoavaliação
-- e como calcular corretamente conclusão, médias e insights

SELECT '=== DIAGNÓSTICO: ESTRUTURA DE COMPETÊNCIAS ===' as titulo;

-- ============================================
-- 1. ESTRUTURA DAS MATÉRIAS (SUBJECTS)
-- ============================================

SELECT '--- 1. MATÉRIAS DISPONÍVEIS ---' as secao;

-- Ver todas as matérias ativas
SELECT 
    id,
    name as materia,
    description as descricao,
    weight as peso,
    is_active as ativa,
    created_at
FROM subjects 
WHERE is_active = true
ORDER BY name;

-- ============================================
-- 2. ESTRUTURA DAS RESPOSTAS
-- ============================================

SELECT '--- 2. ESTRUTURA DAS RESPOSTAS ---' as secao;

-- Ver como estão organizadas as respostas
SELECT 
    aa.assessment_id,
    aa.subject_id,
    s.name as materia,
    aa.question_number,
    aa.question_text,
    aa.answer_value,
    aa.answer_score,
    aa.created_at
FROM assessment_answers aa
JOIN subjects s ON aa.subject_id = s.id
ORDER BY aa.assessment_id, s.name, aa.question_number
LIMIT 20;

-- ============================================
-- 3. QUANTAS PERGUNTAS POR MATÉRIA
-- ============================================

SELECT '--- 3. PERGUNTAS POR MATÉRIA ---' as secao;

-- Contar perguntas únicas por matéria
SELECT 
    s.name as materia,
    COUNT(DISTINCT aa.question_number) as total_perguntas_unicas,
    COUNT(aa.id) as total_respostas,
    COUNT(DISTINCT aa.assessment_id) as avaliacoes_diferentes,
    MIN(aa.answer_score) as nota_minima,
    MAX(aa.answer_score) as nota_maxima,
    ROUND(AVG(aa.answer_score), 2) as media_atual
FROM subjects s
LEFT JOIN assessment_answers aa ON s.id = aa.subject_id
WHERE s.is_active = true
GROUP BY s.id, s.name
ORDER BY s.name;

-- ============================================
-- 4. ANÁLISE DE CONCLUSÃO DAS AVALIAÇÕES
-- ============================================

SELECT '--- 4. ANÁLISE DE CONCLUSÃO ---' as secao;

-- Ver quantas perguntas cada avaliação respondeu
SELECT 
    a.id as assessment_id,
    a.candidate_id,
    a.status,
    a.completed_at,
    COUNT(aa.id) as respostas_dadas,
    COUNT(DISTINCT aa.subject_id) as materias_respondidas,
    COUNT(DISTINCT aa.question_number) as perguntas_unicas_respondidas,
    CASE 
        WHEN a.completed_at IS NOT NULL THEN 'Marcada como completa'
        WHEN COUNT(aa.id) = 0 THEN 'Sem respostas'
        ELSE 'Com respostas parciais'
    END as situacao
FROM assessments a
LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
GROUP BY a.id, a.candidate_id, a.status, a.completed_at
ORDER BY a.created_at DESC;

-- ============================================
-- 5. CÁLCULO DE MÉDIAS POR MATÉRIA E CANDIDATO
-- ============================================

SELECT '--- 5. MÉDIAS POR MATÉRIA E CANDIDATO ---' as secao;

-- Calcular médias reais por matéria para cada candidato
SELECT 
    c.full_name as candidato,
    s.name as materia,
    COUNT(aa.id) as respostas_na_materia,
    ROUND(AVG(aa.answer_score), 2) as media_materia,
    CASE 
        WHEN AVG(aa.answer_score) BETWEEN 1.0 AND 1.5 THEN 'Sem conhecimento'
        WHEN AVG(aa.answer_score) BETWEEN 1.6 AND 2.5 THEN 'Conhecimento básico'
        WHEN AVG(aa.answer_score) BETWEEN 2.6 AND 3.5 THEN 'Conhecimento intermediário'
        WHEN AVG(aa.answer_score) BETWEEN 3.6 AND 4.5 THEN 'Conhecimento avançado'
        WHEN AVG(aa.answer_score) BETWEEN 4.6 AND 5.0 THEN 'Especialista/Expert'
        ELSE 'Não classificado'
    END as classificacao
FROM candidates c
JOIN assessments a ON c.id = a.candidate_id
JOIN assessment_answers aa ON a.id = aa.assessment_id
JOIN subjects s ON aa.subject_id = s.id
WHERE s.is_active = true
GROUP BY c.id, c.full_name, s.id, s.name
ORDER BY c.full_name, s.name;

-- ============================================
-- 6. ESTATÍSTICAS CORRETAS PARA O DASHBOARD
-- ============================================

SELECT '--- 6. ESTATÍSTICAS CORRETAS ---' as secao;

-- Calcular estatísticas baseadas na estrutura real
WITH avaliacoes_completas AS (
    SELECT 
        a.id,
        a.candidate_id,
        COUNT(aa.id) as total_respostas,
        COUNT(DISTINCT aa.subject_id) as materias_respondidas,
        -- Considerar completa se tem respostas e completed_at preenchido
        CASE 
            WHEN a.completed_at IS NOT NULL AND COUNT(aa.id) > 0 THEN true
            ELSE false
        END as esta_completa
    FROM assessments a
    LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
    GROUP BY a.id, a.candidate_id, a.completed_at
)
SELECT 
    'ESTATÍSTICAS CORRETAS' as tipo,
    (SELECT COUNT(*) FROM candidates) as total_candidatos,
    (SELECT COUNT(*) FROM assessments) as total_avaliacoes,
    (SELECT COUNT(*) FROM avaliacoes_completas WHERE esta_completa = true) as avaliacoes_completas,
    CASE 
        WHEN (SELECT COUNT(*) FROM assessments) > 0 THEN
            ROUND(
                (SELECT COUNT(*) FROM avaliacoes_completas WHERE esta_completa = true)::DECIMAL / 
                (SELECT COUNT(*) FROM assessments) * 100, 0
            )
        ELSE 0 
    END as taxa_conclusao_correta;

-- ============================================
-- 7. INSIGHTS DINÂMICOS BASEADOS NOS DADOS
-- ============================================

SELECT '--- 7. INSIGHTS DINÂMICOS ---' as secao;

-- Gerar insights baseados nas médias reais
WITH medias_materias AS (
    SELECT 
        s.name as materia,
        COUNT(aa.id) as total_respostas,
        ROUND(AVG(aa.answer_score), 2) as media_geral,
        COUNT(DISTINCT aa.assessment_id) as candidatos_responderam
    FROM subjects s
    JOIN assessment_answers aa ON s.id = aa.subject_id
    WHERE s.is_active = true
    GROUP BY s.id, s.name
)
SELECT 
    materia,
    media_geral,
    candidatos_responderam,
    CASE 
        WHEN media_geral < 2.5 THEN '🔴 GAP CRÍTICO: Requer treinamento urgente'
        WHEN media_geral BETWEEN 2.5 AND 3.5 THEN '🟡 OPORTUNIDADE: Pode ser desenvolvida'
        WHEN media_geral > 4.0 THEN '🟢 PONTO FORTE: Competência consolidada'
        ELSE '⚪ NEUTRO: Nível adequado'
    END as insight_automatico
FROM medias_materias
ORDER BY media_geral ASC;

-- ============================================
-- RESULTADO
-- ============================================
SELECT '✅ Diagnóstico da estrutura de competências concluído!' as resultado;
