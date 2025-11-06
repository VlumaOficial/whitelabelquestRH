-- ============================================
-- CORREÇÃO URGENTE: CÁLCULO DE SCORE INCORRETO
-- ============================================

-- PROBLEMA IDENTIFICADO:
-- A função calculate_assessment_score estava usando pesos das matérias,
-- causando distorção no cálculo. Um candidato com todas as respostas = 1
-- estava sendo classificado como nível 5 devido aos pesos.

-- SOLUÇÃO: Calcular média simples das respostas (1-5) sem pesos

CREATE OR REPLACE FUNCTION calculate_assessment_score(assessment_uuid UUID)
RETURNS TABLE(total_score DECIMAL, percentage_score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Soma simples das respostas (sem peso)
        COALESCE(SUM(aa.answer_score), 0) as total_score,
        -- Média das respostas convertida para percentual
        CASE 
            WHEN COUNT(aa.id) > 0 THEN 
                -- Média das respostas (1-5) convertida para percentual (0-100)
                ROUND((COALESCE(AVG(aa.answer_score), 0) / 5.0) * 100, 2)
            ELSE 0 
        END as percentage_score
    FROM assessment_answers aa
    WHERE aa.assessment_id = assessment_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RECALCULAR TODOS OS ASSESSMENTS EXISTENTES
-- ============================================

-- Atualizar todos os assessments com o cálculo correto
DO $$
DECLARE
    assessment_record RECORD;
    score_result RECORD;
BEGIN
    -- Percorrer todos os assessments completos
    FOR assessment_record IN 
        SELECT id FROM assessments WHERE status = 'completed'
    LOOP
        -- Calcular score correto para cada assessment
        SELECT * INTO score_result 
        FROM calculate_assessment_score(assessment_record.id);
        
        -- Atualizar o assessment com os valores corretos
        UPDATE assessments 
        SET 
            total_score = score_result.total_score,
            percentage_score = score_result.percentage_score
        WHERE id = assessment_record.id;
        
        RAISE NOTICE 'Assessment % atualizado: total_score=%, percentage_score=%', 
            assessment_record.id, score_result.total_score, score_result.percentage_score;
    END LOOP;
END $$;

-- ============================================
-- VERIFICAÇÃO DOS RESULTADOS
-- ============================================

-- Mostrar alguns exemplos dos scores corrigidos
SELECT 
    a.id,
    a.total_score,
    a.percentage_score,
    COUNT(aa.id) as total_questions,
    AVG(aa.answer_score) as avg_answer,
    MIN(aa.answer_score) as min_answer,
    MAX(aa.answer_score) as max_answer
FROM assessments a
LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
WHERE a.status = 'completed'
GROUP BY a.id, a.total_score, a.percentage_score
ORDER BY a.created_at DESC
LIMIT 10;
