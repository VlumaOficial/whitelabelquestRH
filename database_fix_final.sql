-- ============================================
-- QUEST NÓS - CORREÇÃO DEFINITIVA
-- Execute este comando no SQL Editor do Supabase
-- ============================================

-- 1. PRIMEIRO: Dropar a tabela subjects existente (se houver)
DROP TABLE IF EXISTS subjects CASCADE;

-- 2. CRIAR TABELA DE MATÉRIAS CORRETAMENTE
CREATE TABLE subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERIR AS 8 MATÉRIAS
INSERT INTO subjects (name, description, weight) VALUES 
('Raciocínio Lógico', 'Avaliação de capacidade de raciocínio lógico e resolução de problemas', 1.2),
('Comunicação', 'Habilidades de comunicação verbal e escrita', 1.0),
('Trabalho em Equipe', 'Capacidade de colaboração e trabalho em grupo', 1.1),
('Liderança', 'Potencial de liderança e tomada de decisão', 1.3),
('Criatividade', 'Pensamento criativo e inovação', 1.0),
('Adaptabilidade', 'Flexibilidade e adaptação a mudanças', 1.1),
('Conhecimento Técnico', 'Conhecimentos específicos da área', 1.4),
('Inteligência Emocional', 'Gestão emocional e relacionamento interpessoal', 1.2);

-- 4. VERIFICAR SE FOI CRIADO CORRETAMENTE
SELECT COUNT(*) as total_subjects FROM subjects;
SELECT name, weight FROM subjects ORDER BY name;
