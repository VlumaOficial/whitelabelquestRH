# 🔐 Criação de Usuários Admin - PASSO A PASSO

**⚠️ IMPORTANTE:** Execute cada bloco SEPARADAMENTE no Supabase SQL Editor

---

## PASSO 1: Habilitar Extensão pgcrypto

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Resultado Esperado:** `CREATE EXTENSION` ou `NOTICE: extension "pgcrypto" already exists`

---

## PASSO 2: Dropar Tabela (se existir)

```sql
DROP TABLE IF EXISTS admin_users CASCADE;
```

**Resultado Esperado:** `DROP TABLE` ou `NOTICE: table "admin_users" does not exist`

---

## PASSO 3: Criar Tabela

```sql
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
```

**Resultado Esperado:** `CREATE TABLE`

---

## PASSO 4: Criar Índices

```sql
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
```

**Resultado Esperado:** `CREATE INDEX` (3x)

---

## PASSO 5: Habilitar RLS

```sql
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

**Resultado Esperado:** `ALTER TABLE`

---

## PASSO 6: Criar Política de SELECT

```sql
CREATE POLICY "Allow public read for login"
  ON admin_users
  FOR SELECT
  USING (true);
```

**Resultado Esperado:** `CREATE POLICY`

---

## PASSO 7: Criar Política de UPDATE

```sql
CREATE POLICY "Admin users can update their own data"
  ON admin_users
  FOR UPDATE
  USING (auth.uid()::text = id::text);
```

**Resultado Esperado:** `CREATE POLICY`

---

## PASSO 8: Criar Função verify_admin_login

```sql
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
    
  IF FOUND THEN
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE admin_users.email = p_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Resultado Esperado:** `CREATE FUNCTION`

---

## PASSO 9: Criar Função create_admin_user

```sql
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
  IF p_role NOT IN ('admin', 'consulta') THEN
    RAISE EXCEPTION 'Role inválido. Use "admin" ou "consulta"';
  END IF;
  
  INSERT INTO admin_users (email, password_hash, full_name, role)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name, p_role)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Resultado Esperado:** `CREATE FUNCTION`

---

## PASSO 10: Criar Usuário Admin

```sql
SELECT create_admin_user(
  'admin@questnos.com',
  'Admin@2025',
  'Administrador',
  'admin'
);
```

**Resultado Esperado:** Um UUID (ex: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

## PASSO 11: Criar Usuário Consulta

```sql
SELECT create_admin_user(
  'consulta@questnos.com',
  'Consulta@2025',
  'Usuário Consulta',
  'consulta'
);
```

**Resultado Esperado:** Um UUID (ex: `b2c3d4e5-f6a7-8901-bcde-f12345678901`)

---

## PASSO 12: Verificar Usuários Criados

```sql
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  is_active, 
  created_at 
FROM admin_users 
ORDER BY created_at DESC;
```

**Resultado Esperado:** Tabela com 2 usuários:
```
id                                   | email                    | full_name         | role      | is_active | created_at
-------------------------------------|--------------------------|-------------------|-----------|-----------|-------------------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | admin@questnos.com       | Administrador     | admin     | true      | 2025-11-06 21:00:00
b2c3d4e5-f6a7-8901-bcde-f12345678901 | consulta@questnos.com    | Usuário Consulta  | consulta  | true      | 2025-11-06 21:00:01
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Após executar todos os passos, verifique:

- [ ] Extensão pgcrypto habilitada
- [ ] Tabela admin_users criada
- [ ] 3 índices criados
- [ ] RLS habilitado
- [ ] 2 políticas criadas
- [ ] 2 funções criadas
- [ ] 2 usuários criados
- [ ] Query de verificação retorna 2 linhas

---

## 🧪 TESTAR LOGIN

Após criar os usuários, teste o login:

1. Acesse: `https://seusite.com/admin/login`
2. Teste com: `admin@questnos.com` / `Admin@2025`
3. Deve redirecionar para dashboard
4. Verifique se aparece "Administrador" no header
5. Verifique se botão "Excluir Candidato" aparece

Depois teste com usuário consulta:

1. Faça logout
2. Login com: `consulta@questnos.com` / `Consulta@2025`
3. Deve redirecionar para dashboard
4. Verifique se aparece "Consulta" no header
5. Verifique se botão "Excluir Candidato" NÃO aparece

---

## 🔒 ALTERAR SENHAS

**IMPORTANTE:** Altere as senhas padrão imediatamente!

```sql
-- Alterar senha do admin
UPDATE admin_users 
SET password_hash = crypt('SUA_NOVA_SENHA_FORTE', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@questnos.com';

-- Alterar senha do consulta
UPDATE admin_users 
SET password_hash = crypt('SUA_NOVA_SENHA_FORTE', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'consulta@questnos.com';
```

---

## 🆘 TROUBLESHOOTING

### Erro: "extension pgcrypto does not exist"
**Solução:** Execute o PASSO 1 novamente

### Erro: "relation admin_users already exists"
**Solução:** Execute o PASSO 2 para dropar a tabela

### Erro: "function crypt does not exist"
**Solução:** Extensão pgcrypto não foi habilitada. Execute PASSO 1

### Erro: "duplicate key value violates unique constraint"
**Solução:** Usuário já existe. Use email diferente ou delete o existente:
```sql
DELETE FROM admin_users WHERE email = 'admin@questnos.com';
```

### Nenhum usuário retornado na verificação
**Solução:** Execute os PASSOS 10 e 11 novamente

---

## 📝 COMANDOS ÚTEIS

### Listar todos os usuários
```sql
SELECT * FROM admin_users ORDER BY created_at DESC;
```

### Deletar um usuário
```sql
DELETE FROM admin_users WHERE email = 'usuario@exemplo.com';
```

### Desativar um usuário
```sql
UPDATE admin_users 
SET is_active = false, updated_at = NOW()
WHERE email = 'usuario@exemplo.com';
```

### Reativar um usuário
```sql
UPDATE admin_users 
SET is_active = true, updated_at = NOW()
WHERE email = 'usuario@exemplo.com';
```

### Alterar role de um usuário
```sql
UPDATE admin_users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'usuario@exemplo.com';
```

### Ver último login
```sql
SELECT email, full_name, last_login 
FROM admin_users 
ORDER BY last_login DESC NULLS LAST;
```

---

**Criado em:** 06/11/2025  
**Versão:** 1.0  
**Projeto:** Quest Nós - Sistema de Autenticação Admin
