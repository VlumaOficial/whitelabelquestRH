-- ============================================
-- VERIFICAÇÃO DETALHADA DO CANDIDATO: sdorea@coreait.com.br
-- ============================================

-- 1. INFORMAÇÕES BÁSICAS DO CANDIDATO
SELECT 
    'DADOS DO CANDIDATO' as secao,
    c.id as candidate_id,
    c.full_name,
    c.email,
    c.created_at as registro_em
FROM candidates c 
WHERE c.email = 'sdorea@coreait.com.br';

-- 2. ASSESSMENTS DO CANDIDATO
SELECT 
    'ASSESSMENTS' as secao,
    a.id as assessment_id,
    a.status,
    a.started_at,
    a.completed_at,
    a.total_score,
    a.percentage_score,
    a.time_spent_minutes
FROM assessments a
JOIN candidates c ON a.candidate_id = c.id
WHERE c.email = 'sdorea@coreait.com.br'
ORDER BY a.created_at DESC;

-- 3. RESPOSTAS DETALHADAS (TODAS AS QUESTÕES)
SELECT 
    'RESPOSTAS DETALHADAS' as secao,
    aa.assessment_id,
    aa.question_number,
    aa.question_text,
    aa.answer_score,
    s.name as materia,
    s.weight as peso_materia
FROM assessment_answers aa
JOIN assessments a ON aa.assessment_id = a.id
JOIN candidates c ON a.candidate_id = c.id
JOIN subjects s ON aa.subject_id = s.id
WHERE c.email = 'sdorea@coreait.com.br'
ORDER BY aa.assessment_id DESC, aa.question_number;

-- 4. ESTATÍSTICAS POR ASSESSMENT
SELECT 
    'ESTATÍSTICAS POR ASSESSMENT' as secao,
    aa.assessment_id,
    COUNT(*) as total_questoes,
    MIN(aa.answer_score) as menor_resposta,
    MAX(aa.answer_score) as maior_resposta,
    AVG(aa.answer_score) as media_respostas,
    SUM(aa.answer_score) as soma_respostas,
    -- Cálculo manual da porcentagem
    ROUND((AVG(aa.answer_score) / 5.0) * 100, 2) as percentual_calculado_manual
FROM assessment_answers aa
JOIN assessments a ON aa.assessment_id = a.id
JOIN candidates c ON a.candidate_id = c.id
WHERE c.email = 'sdorea@coreait.com.br'
GROUP BY aa.assessment_id
ORDER BY aa.assessment_id DESC;

-- 5. ESTATÍSTICAS POR MATÉRIA (ÚLTIMO ASSESSMENT)
WITH ultimo_assessment AS (
    SELECT a.id
    FROM assessments a
    JOIN candidates c ON a.candidate_id = c.id
    WHERE c.email = 'sdorea@coreait.com.br'
    ORDER BY a.created_at DESC
    LIMIT 1
)
SELECT 
    'ESTATÍSTICAS POR MATÉRIA' as secao,
    s.name as materia,
    s.weight as peso,
    COUNT(*) as qtd_questoes,
    AVG(aa.answer_score) as media_materia,
    MIN(aa.answer_score) as min_materia,
    MAX(aa.answer_score) as max_materia,
    SUM(aa.answer_score) as soma_materia
FROM assessment_answers aa
JOIN ultimo_assessment ua ON aa.assessment_id = ua.id
JOIN subjects s ON aa.subject_id = s.id
GROUP BY s.name, s.weight
ORDER BY s.name;

-- 6. VERIFICAÇÃO DO CÁLCULO CORRETO
WITH ultimo_assessment AS (
    SELECT a.id, a.total_score, a.percentage_score
    FROM assessments a
    JOIN candidates c ON a.candidate_id = c.id
    WHERE c.email = 'sdorea@coreait.com.br'
    ORDER BY a.created_at DESC
    LIMIT 1
),
calculo_manual AS (
    SELECT 
        ua.id as assessment_id,
        ua.total_score as score_banco,
        ua.percentage_score as percentual_banco,
        COUNT(*) as total_questoes,
        SUM(aa.answer_score) as soma_respostas,
        AVG(aa.answer_score) as media_respostas,
        ROUND((AVG(aa.answer_score) / 5.0) * 100, 2) as percentual_manual
    FROM ultimo_assessment ua
    JOIN assessment_answers aa ON aa.assessment_id = ua.id
    GROUP BY ua.id, ua.total_score, ua.percentage_score
)
SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    cm.assessment_id,
    cm.total_questoes,
    cm.soma_respostas,
    cm.media_respostas,
    cm.score_banco as "Score no Banco",
    cm.percentual_banco as "% no Banco",
    cm.percentual_manual as "% Calculado Manual",
    CASE 
        WHEN ABS(cm.percentual_banco - cm.percentual_manual) < 0.01 THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status_calculo,
    -- Classificação por nível
    CASE 
        WHEN cm.percentual_manual >= 81 THEN 'Nível 5 - Especialista'
        WHEN cm.percentual_manual >= 61 THEN 'Nível 4 - Avançado'
        WHEN cm.percentual_manual >= 41 THEN 'Nível 3 - Intermediário'
        WHEN cm.percentual_manual >= 21 THEN 'Nível 2 - Básico'
        ELSE 'Nível 1 - Sem conhecimento'
    END as classificacao
FROM calculo_manual cm;

-- 7. AMOSTRA DAS PRIMEIRAS 20 RESPOSTAS (para verificação manual)
SELECT 
    'AMOSTRA DE RESPOSTAS' as secao,
    aa.question_number,
    LEFT(aa.question_text, 50) || '...' as questao_resumida,
    aa.answer_score,
    s.name as materia
FROM assessment_answers aa
JOIN assessments a ON aa.assessment_id = a.id
JOIN candidates c ON a.candidate_id = c.id
JOIN subjects s ON aa.subject_id = s.id
WHERE c.email = 'sdorea@coreait.com.br'
ORDER BY a.created_at DESC, aa.question_number
LIMIT 20;
