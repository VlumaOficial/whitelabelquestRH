-- ============================================
-- CONSULTA 2: ESTRUTURA DAS RESPOSTAS
-- ============================================

-- Ver como estão organizadas as respostas (primeiras 10)
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
LIMIT 10;
