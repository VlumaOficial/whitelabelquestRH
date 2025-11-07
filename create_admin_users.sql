-- ============================================
-- CRIAR SISTEMA DE AUTENTICAÇÃO ADMIN
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 0. Habilitar extensão pgcrypto (necessária para crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Dropar tabela se existir (para recriar limpa)
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Criar tabela de usuários admin
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'consulta')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- 3. Criar índices
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança
-- Política para SELECT: permite visualização pública (necessário para login)
CREATE POLICY "Allow public read for login"
  ON admin_users
  FOR SELECT
  USING (true);

-- Política para UPDATE: apenas o próprio usuário pode atualizar
CREATE POLICY "Admin users can update their own data"
  ON admin_users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- 6. Criar função para verificar login
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.full_name,
    au.role,
    au.is_active
  FROM admin_users au
  WHERE au.email = p_email
    AND au.password_hash = crypt(p_password, au.password_hash)
    AND au.is_active = true;
    
  -- Atualizar último login se encontrou usuário
  IF FOUND THEN
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE admin_users.email = p_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função para criar usuário admin (com hash de senha)
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Validar role
  IF p_role NOT IN ('admin', 'consulta') THEN
    RAISE EXCEPTION 'Role inválido. Use "admin" ou "consulta"';
  END IF;
  
  -- Inserir usuário com senha hasheada
  INSERT INTO admin_users (email, password_hash, full_name, role)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name, p_role)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar usuários padrão (ALTERE AS SENHAS!)
-- IMPORTANTE: Altere estas senhas antes de usar em produção!

-- Usuário Admin
SELECT create_admin_user(
  'admin@questnos.com',
  'Admin@2025',  -- ALTERE ESTA SENHA!
  'Administrador',
  'admin'
);

-- Usuário Consulta
SELECT create_admin_user(
  'consulta@questnos.com',
  'Consulta@2025',  -- ALTERE ESTA SENHA!
  'Usuário Consulta',
  'consulta'
);

-- 9. Verificar usuários criados
SELECT id, email, full_name, role, is_active, created_at 
FROM admin_users 
ORDER BY created_at DESC;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. ALTERE as senhas padrão imediatamente
-- 3. Para criar novos usuários, use:
--    SELECT create_admin_user('email@exemplo.com', 'senha123', 'Nome Completo', 'admin');
-- 4. Para desativar um usuário:
--    UPDATE admin_users SET is_active = false WHERE email = 'email@exemplo.com';
-- 5. Para alterar senha:
--    UPDATE admin_users SET password_hash = crypt('nova_senha', gen_salt('bf')) WHERE email = 'email@exemplo.com';
