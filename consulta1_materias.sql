-- ============================================
-- CONSULTA 1: MATÉRIAS DISPONÍVEIS
-- ============================================

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
