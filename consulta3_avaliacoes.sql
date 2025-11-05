-- ============================================
-- CONSULTA 3: STATUS DAS AVALIAÇÕES
-- ============================================

-- Ver status e conclusão das avaliações
SELECT 
    a.id as assessment_id,
    a.candidate_id,
    a.status,
    a.started_at,
    a.completed_at,
    a.total_score,
    a.percentage_score,
    COUNT(aa.id) as total_respostas
FROM assessments a
LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
GROUP BY a.id, a.candidate_id, a.status, a.started_at, a.completed_at, a.total_score, a.percentage_score
ORDER BY a.created_at DESC;
