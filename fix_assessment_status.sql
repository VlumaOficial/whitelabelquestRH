-- ============================================
-- CORREÇÃO DO STATUS DAS AVALIAÇÕES - PARTE 1
-- ============================================

-- 1. CRIAR FUNÇÃO PARA CORRIGIR STATUS
-- ============================================

CREATE OR REPLACE FUNCTION fix_assessment_status()
RETURNS TABLE(
    assessments_updated INTEGER,
    message TEXT
) AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Atualizar status das avaliações que têm completed_at mas status incorreto
    UPDATE assessments 
    SET 
        status = 'completed',
        updated_at = NOW()
    WHERE completed_at IS NOT NULL 
    AND status != 'completed';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN QUERY SELECT 
        updated_count,
        CASE 
            WHEN updated_count > 0 THEN 
                'Corrigido status de ' || updated_count || ' avaliações'
            ELSE 
                'Nenhuma avaliação precisou de correção'
        END;
END;
$$ LANGUAGE plpgsql;

-- 2. EXECUTAR CORREÇÃO
-- ============================================

SELECT * FROM fix_assessment_status();

-- 3. VERIFICAR RESULTADO
-- ============================================

-- Ver status atual das avaliações
SELECT 
    'APÓS CORREÇÃO' as momento,
    status,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as com_completed_at
FROM assessments 
GROUP BY status
ORDER BY status;

-- Listar avaliações com detalhes
SELECT 
    id,
    candidate_id,
    status,
    started_at,
    completed_at,
    total_score,
    percentage_score,
    CASE 
        WHEN completed_at IS NOT NULL AND status = 'completed' THEN '✅ OK'
        WHEN completed_at IS NOT NULL AND status != 'completed' THEN '❌ PROBLEMA: Tem completed_at mas status incorreto'
        WHEN completed_at IS NULL AND status = 'completed' THEN '⚠️ ATENÇÃO: Status completed sem completed_at'
        ELSE '🔄 Em andamento'
    END as diagnostico
FROM assessments
ORDER BY started_at DESC;

-- 4. ATUALIZAR VIEWS PARA USAR LÓGICA CORRETA
-- ============================================

-- Recriar candidate_summary com lógica correta
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
    COALESCE(COUNT(CASE WHEN a.completed_at IS NOT NULL THEN 1 END), 0) as completed_assessments,
    COALESCE(AVG(CASE WHEN a.completed_at IS NOT NULL THEN a.percentage_score END), 0) as avg_score,
    MAX(a.completed_at) as last_assessment_date
FROM candidates c
LEFT JOIN assessments a ON c.id = a.candidate_id
GROUP BY c.id, c.full_name, c.email, c.phone, c.education_level, c.experience_years, c.created_at
ORDER BY c.created_at DESC;

-- 5. TESTAR ESTATÍSTICAS CORRETAS
-- ============================================

SELECT 
    'ESTATÍSTICAS CORRETAS' as tipo,
    (SELECT COUNT(*) FROM candidates) as total_candidatos,
    (SELECT COUNT(*) FROM assessments) as total_avaliacoes,
    (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL) as avaliacoes_completas,
    CASE 
        WHEN (SELECT COUNT(*) FROM assessments) > 0 THEN
            ROUND(
                (SELECT COUNT(*) FROM assessments WHERE completed_at IS NOT NULL)::DECIMAL / 
                (SELECT COUNT(*) FROM assessments) * 100, 0
            )
        ELSE 0 
    END as taxa_conclusao_pct;

-- Testar candidate_summary
SELECT 
    'CANDIDATE_SUMMARY' as view_name,
    COUNT(*) as total_records,
    SUM(total_assessments) as soma_avaliacoes,
    SUM(completed_assessments) as soma_completas
FROM candidate_summary;

-- Ver dados detalhados
SELECT * FROM candidate_summary;

-- ============================================
-- RESULTADO
-- ============================================
SELECT '✅ Parte 1 - Status das avaliações corrigido!' as status;
