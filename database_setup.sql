-- ============================================
-- QUEST NÓS - CONFIGURAÇÃO DO BANCO DE DADOS
-- ============================================

-- 1. VERIFICAR SE AS TABELAS JÁ EXISTEM
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('candidates', 'assessments', 'assessment_answers', 'subjects', 'admin_users');

-- ============================================
-- 2. CRIAR TABELAS PRINCIPAIS
-- ============================================

-- Tabela de Matérias/Áreas de Avaliação
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Adicionado UNIQUE constraint
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00, -- Peso da matéria na avaliação geral
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Candidatos
CREATE TABLE IF NOT EXISTS candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(50),
    education_level VARCHAR(100),
    experience_years INTEGER,
    accessibility_needs TEXT,
    preferred_language VARCHAR(10) DEFAULT 'pt-BR',
    consent_data_processing BOOLEAN DEFAULT false,
    consent_marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Avaliações/Questionários
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score DECIMAL(5,2),
    percentage_score DECIMAL(5,2),
    time_spent_minutes INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Respostas do Questionário
CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id),
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_value TEXT NOT NULL,
    answer_score DECIMAL(5,2),
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários Administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_candidate_id ON assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_subject_id ON assessment_answers(subject_id);

-- ============================================
-- 4. INSERIR DADOS INICIAIS - MATÉRIAS
-- ============================================

INSERT INTO subjects (name, description, weight) VALUES 
('Raciocínio Lógico', 'Avaliação de capacidade de raciocínio lógico e resolução de problemas', 1.2),
('Comunicação', 'Habilidades de comunicação verbal e escrita', 1.0),
('Trabalho em Equipe', 'Capacidade de colaboração e trabalho em grupo', 1.1),
('Liderança', 'Potencial de liderança e tomada de decisão', 1.3),
('Criatividade', 'Pensamento criativo e inovação', 1.0),
('Adaptabilidade', 'Flexibilidade e adaptação a mudanças', 1.1),
('Conhecimento Técnico', 'Conhecimentos específicos da área', 1.4),
('Inteligência Emocional', 'Gestão emocional e relacionamento interpessoal', 1.2)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. CRIAR VIEWS PARA RELATÓRIOS
-- ============================================

-- View: Resumo de Candidatos
CREATE OR REPLACE VIEW candidate_summary AS
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.created_at as registration_date,
    COUNT(a.id) as total_assessments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assessments,
    AVG(CASE WHEN a.status = 'completed' THEN a.percentage_score END) as avg_score,
    MAX(a.completed_at) as last_assessment_date
FROM candidates c
LEFT JOIN assessments a ON c.id = a.candidate_id
GROUP BY c.id, c.full_name, c.email, c.created_at;

-- View: Desempenho por Matéria
CREATE OR REPLACE VIEW subject_performance AS
SELECT 
    s.name as subject_name,
    s.description as subject_description,
    COUNT(aa.id) as total_answers,
    AVG(aa.answer_score) as avg_score,
    COUNT(CASE WHEN aa.is_correct = true THEN 1 END) as correct_answers,
    ROUND(
        (COUNT(CASE WHEN aa.is_correct = true THEN 1 END)::DECIMAL / COUNT(aa.id)) * 100, 2
    ) as success_rate_percentage
FROM subjects s
LEFT JOIN assessment_answers aa ON s.id = aa.subject_id
GROUP BY s.id, s.name, s.description;

-- View: Relatório Detalhado de Avaliação
CREATE OR REPLACE VIEW assessment_detailed_report AS
SELECT 
    a.id as assessment_id,
    c.full_name as candidate_name,
    c.email as candidate_email,
    a.status,
    a.started_at,
    a.completed_at,
    a.total_score,
    a.percentage_score,
    a.time_spent_minutes,
    COUNT(aa.id) as total_questions_answered,
    COUNT(CASE WHEN aa.is_correct = true THEN 1 END) as correct_answers,
    ROUND(
        (COUNT(CASE WHEN aa.is_correct = true THEN 1 END)::DECIMAL / COUNT(aa.id)) * 100, 2
    ) as accuracy_percentage
FROM assessments a
JOIN candidates c ON a.candidate_id = c.id
LEFT JOIN assessment_answers aa ON a.id = aa.assessment_id
GROUP BY a.id, c.full_name, c.email, a.status, a.started_at, a.completed_at, 
         a.total_score, a.percentage_score, a.time_spent_minutes;

-- ============================================
-- 6. CRIAR FUNÇÕES PARA CÁLCULOS
-- ============================================

-- Função para calcular score total de uma avaliação
CREATE OR REPLACE FUNCTION calculate_assessment_score(assessment_uuid UUID)
RETURNS TABLE(total_score DECIMAL, percentage_score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(aa.answer_score * s.weight), 0) as total_score,
        CASE 
            WHEN COUNT(aa.id) > 0 THEN 
                ROUND((COALESCE(SUM(aa.answer_score * s.weight), 0) / SUM(s.weight)) * 100, 2)
            ELSE 0 
        END as percentage_score
    FROM assessment_answers aa
    JOIN subjects s ON aa.subject_id = s.id
    WHERE aa.assessment_id = assessment_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para candidatos (podem ver apenas seus próprios dados)
CREATE POLICY "Candidates can view own data" ON candidates
    FOR SELECT USING (auth.uid()::text = id::text);

-- Política para administradores (podem ver todos os dados)
CREATE POLICY "Admins can view all data" ON candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND is_active = true
        )
    );

-- ============================================
-- 8. COMANDOS DE VERIFICAÇÃO
-- ============================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('candidates', 'assessments', 'assessment_answers', 'subjects', 'admin_users')
ORDER BY table_name;

-- Verificar se as matérias foram inseridas
SELECT COUNT(*) as total_subjects FROM subjects;

-- Verificar se as views foram criadas
SELECT 
    table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('candidate_summary', 'subject_performance', 'assessment_detailed_report');

-- ============================================
-- 9. COMANDOS PARA TESTES
-- ============================================

-- Inserir um candidato de teste (OPCIONAL - apenas para teste)
/*
INSERT INTO candidates (email, full_name, phone, gender, education_level) 
VALUES ('teste@questnos.com', 'Candidato Teste', '11999999999', 'Não informado', 'Superior Completo');
*/

-- Verificar estrutura das tabelas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'candidates'
ORDER BY ordinal_position;
