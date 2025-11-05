-- ============================================
-- ADICIONAR CAMPOS DE APRESENTAÇÃO PESSOAL
-- ============================================

-- 1. Adicionar campos à tabela candidates
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS personal_presentation TEXT,
ADD COLUMN IF NOT EXISTS additional_skills TEXT,
ADD COLUMN IF NOT EXISTS highlighted_soft_skills TEXT,
ADD COLUMN IF NOT EXISTS relevant_experiences TEXT,
ADD COLUMN IF NOT EXISTS professional_goals TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS behance_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS presentation_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. Comentários para documentação
COMMENT ON COLUMN candidates.personal_presentation IS 'Apresentação pessoal do candidato (500-1000 caracteres)';
COMMENT ON COLUMN candidates.additional_skills IS 'Habilidades técnicas adicionais não cobertas no questionário';
COMMENT ON COLUMN candidates.highlighted_soft_skills IS 'Soft skills que o candidato destaca';
COMMENT ON COLUMN candidates.relevant_experiences IS 'Experiências profissionais relevantes';
COMMENT ON COLUMN candidates.professional_goals IS 'Objetivos e aspirações profissionais';
COMMENT ON COLUMN candidates.linkedin_url IS 'URL do perfil LinkedIn';
COMMENT ON COLUMN candidates.portfolio_url IS 'URL do portfólio ou site pessoal';
COMMENT ON COLUMN candidates.github_url IS 'URL do perfil GitHub';
COMMENT ON COLUMN candidates.behance_url IS 'URL do perfil Behance/Dribbble';
COMMENT ON COLUMN candidates.instagram_url IS 'URL do Instagram profissional';
COMMENT ON COLUMN candidates.presentation_completed_at IS 'Data/hora quando completou a apresentação pessoal';

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_candidates_presentation_completed 
ON candidates(presentation_completed_at) 
WHERE presentation_completed_at IS NOT NULL;

-- 4. Verificar se as colunas foram adicionadas
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'candidates' 
AND column_name IN (
    'personal_presentation', 'additional_skills', 'highlighted_soft_skills',
    'relevant_experiences', 'professional_goals', 'linkedin_url',
    'portfolio_url', 'github_url', 'behance_url', 'instagram_url',
    'presentation_completed_at'
)
ORDER BY column_name;

-- 5. Função para validar URLs (opcional)
CREATE OR REPLACE FUNCTION validate_social_urls()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar LinkedIn
    IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url !~ '^https?://(www\.)?linkedin\.com/.*' THEN
        RAISE EXCEPTION 'LinkedIn URL deve começar com https://linkedin.com/ ou https://www.linkedin.com/';
    END IF;
    
    -- Validar GitHub
    IF NEW.github_url IS NOT NULL AND NEW.github_url !~ '^https?://(www\.)?github\.com/.*' THEN
        RAISE EXCEPTION 'GitHub URL deve começar com https://github.com/';
    END IF;
    
    -- Validar Instagram
    IF NEW.instagram_url IS NOT NULL AND NEW.instagram_url !~ '^https?://(www\.)?instagram\.com/.*' THEN
        RAISE EXCEPTION 'Instagram URL deve começar com https://instagram.com/';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para validação (opcional - pode ser removido se preferir validação no frontend)
-- DROP TRIGGER IF EXISTS validate_urls_trigger ON candidates;
-- CREATE TRIGGER validate_urls_trigger
--     BEFORE INSERT OR UPDATE ON candidates
--     FOR EACH ROW
--     EXECUTE FUNCTION validate_social_urls();

SELECT '✅ Campos de apresentação pessoal adicionados com sucesso!' as status;
