-- ============================================
-- QUEST NÓS - CORREÇÃO DO BANCO DE DADOS
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================

-- 1. CRIAR TABELA DE MATÉRIAS (com UNIQUE constraint)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERIR MATÉRIAS (agora funcionará com ON CONFLICT)
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

-- 3. VERIFICAR SE FOI CRIADO
SELECT COUNT(*) as total_subjects FROM subjects;
SELECT name, weight FROM subjects ORDER BY name;
