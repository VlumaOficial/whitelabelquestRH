-- ============================================
-- ALTERAR SENHAS DOS USUÁRIOS EXISTENTES
-- Execute após verificar os usuários existentes
-- ============================================

-- IMPORTANTE: Substitua os emails pelos encontrados na verificação!

-- ============================================
-- OPÇÃO 1: ALTERAR SENHA NA TABELA AUTH.USERS (Supabase Auth)
-- ============================================

-- Para alterar senha de usuário do Supabase Auth:
-- SUBSTITUA 'email_encontrado@exemplo.com' pelo email real
-- SUBSTITUA 'nova_senha_123' pela senha desejada

UPDATE auth.users 
SET 
    encrypted_password = crypt('nova_senha_123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'email_encontrado@exemplo.com';

-- Exemplo com emails específicos (AJUSTE CONFORME NECESSÁRIO):
-- UPDATE auth.users 
-- SET encrypted_password = crypt('VlumaAdmin2024!', gen_salt('bf')), updated_at = NOW()
-- WHERE email = 'admin@vluma.com.br';

-- ============================================
-- OPÇÃO 2: ALTERAR SENHA NA TABELA PROFILES
-- ============================================

-- Se existir campo password_hash na tabela profiles:
UPDATE profiles 
SET 
    password_hash = crypt('nova_senha_123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'email_encontrado@exemplo.com';

-- ============================================
-- OPÇÃO 3: ALTERAR SENHA NA TABELA ADMIN_USERS
-- ============================================

-- Para usuários da tabela admin_users:
UPDATE admin_users 
SET 
    password_hash = crypt('nova_senha_123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'email_encontrado@exemplo.com';

-- ============================================
-- SCRIPTS ESPECÍFICOS PARA USUÁRIOS COMUNS
-- ============================================

-- 1. ALTERAR SENHA DO ADMIN PRINCIPAL
-- (Ajuste o email conforme encontrado na verificação)
UPDATE auth.users 
SET 
    encrypted_password = crypt('Admin123!', gen_salt('bf')),
    updated_at = NOW()
WHERE email LIKE '%admin%' 
   OR email LIKE '%vluma%'
   OR role = 'admin';

-- 2. ALTERAR SENHA DE USUÁRIOS ESPECÍFICOS
-- Template para copiar e ajustar:

/*
-- USUÁRIO 1 (SUBSTITUA OS VALORES):
UPDATE auth.users 
SET encrypted_password = crypt('SenhaSegura123!', gen_salt('bf')), updated_at = NOW()
WHERE email = 'usuario1@exemplo.com';

-- USUÁRIO 2 (SUBSTITUA OS VALORES):
UPDATE auth.users 
SET encrypted_password = crypt('OutraSenha456!', gen_salt('bf')), updated_at = NOW()
WHERE email = 'usuario2@exemplo.com';
*/

-- ============================================
-- CRIAR USUÁRIO ADMIN SE NÃO EXISTIR
-- ============================================

-- Se não encontrar nenhum admin, criar um novo:
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@vluma.com.br',
    crypt('VlumaAdmin2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "admin", "full_name": "Administrador Vluma"}',
    false
) ON CONFLICT (email) DO NOTHING;

-- E criar o profile correspondente:
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) 
SELECT 
    id,
    'admin@vluma.com.br',
    'Administrador Vluma',
    'admin',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@vluma.com.br'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICAR ALTERAÇÕES
-- ============================================

-- Após alterar, verificar se funcionou:
SELECT 
    id,
    email,
    created_at,
    updated_at,
    raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email IN (
    'admin@vluma.com.br',
    'admin@questnos.com',
    'consulta@questnos.com'
)
ORDER BY created_at DESC;

-- ============================================
-- TESTAR LOGIN (FUNÇÃO AUXILIAR)
-- ============================================

-- Criar função para testar se a senha está correta:
CREATE OR REPLACE FUNCTION test_password(
    user_email TEXT,
    test_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    stored_password TEXT;
BEGIN
    SELECT encrypted_password INTO stored_password
    FROM auth.users
    WHERE email = user_email;
    
    IF stored_password IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN stored_password = crypt(test_password, stored_password);
END;
$$ LANGUAGE plpgsql;

-- Testar senhas (retorna true se estiver correta):
SELECT test_password('admin@vluma.com.br', 'VlumaAdmin2024!');
SELECT test_password('admin@questnos.com', 'Admin@2025');

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
/*
1. PRIMEIRO: Execute VERIFICAR_USUARIOS_EXISTENTES.sql
2. ANOTE os emails encontrados
3. SUBSTITUA os emails nos comandos UPDATE acima
4. DEFINA senhas seguras
5. Execute os comandos UPDATE um por vez
6. TESTE o login com as novas senhas
7. Use a função test_password() para verificar

EXEMPLO DE FLUXO:
1. Encontrou: admin@sistema.com
2. Execute: UPDATE auth.users SET encrypted_password = crypt('MinhaNovaSenh@123', gen_salt('bf')) WHERE email = 'admin@sistema.com';
3. Teste: SELECT test_password('admin@sistema.com', 'MinhaNovaSenh@123');
4. Se retornar TRUE, a senha foi alterada com sucesso!
*/
