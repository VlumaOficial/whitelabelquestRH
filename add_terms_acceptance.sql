-- ============================================
-- ADICIONAR CAMPOS DE ACEITE DE TERMOS
-- ============================================

-- Adicionar campos para aceite de termos e política de privacidade
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_acceptance_ip INET;

-- Comentários para documentação
COMMENT ON COLUMN candidates.terms_accepted IS 'Indica se o candidato aceitou os Termos de Uso';
COMMENT ON COLUMN candidates.terms_accepted_at IS 'Data e hora do aceite dos Termos de Uso';
COMMENT ON COLUMN candidates.privacy_policy_accepted IS 'Indica se o candidato aceitou a Política de Privacidade';
COMMENT ON COLUMN candidates.privacy_policy_accepted_at IS 'Data e hora do aceite da Política de Privacidade';
COMMENT ON COLUMN candidates.terms_acceptance_ip IS 'Endereço IP do aceite dos termos';

-- Criar índice para consultas por aceite
CREATE INDEX IF NOT EXISTS idx_candidates_terms_accepted ON candidates(terms_accepted);
CREATE INDEX IF NOT EXISTS idx_candidates_privacy_accepted ON candidates(privacy_policy_accepted);

-- Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'candidates'
AND column_name IN ('terms_accepted', 'terms_accepted_at', 'privacy_policy_accepted', 'privacy_policy_accepted_at', 'terms_acceptance_ip')
ORDER BY ordinal_position;
