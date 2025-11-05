# 🔧 Correção de Erros - Quest Nós

## ❌ **Problemas Identificados:**

### **1. Erro RLS (Row Level Security) - 401**
- **Causa**: Políticas de segurança muito restritivas
- **Sintoma**: `new row violates row-level security policy for table "candidates"`

### **2. Erro NaN no Formulário**
- **Causa**: Campo numérico retornando `NaN` quando vazio
- **Sintoma**: `Warning: Received NaN for the value attribute`

## ✅ **Soluções Implementadas:**

### **🔐 Correção RLS - Execute no Supabase:**

**No SQL Editor do Supabase, execute:**

```sql
-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers DISABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS PERMISSIVAS
CREATE POLICY "Allow public candidate creation" ON candidates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public candidate read" ON candidates
    FOR SELECT USING (true);

CREATE POLICY "Allow public assessment creation" ON assessments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public assessment read" ON assessments
    FOR SELECT USING (true);

CREATE POLICY "Allow public answers creation" ON assessment_answers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public answers read" ON assessment_answers
    FOR SELECT USING (true);

-- 3. REABILITAR RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
```

### **🔢 Correção Campo Numérico:**
- ✅ **Corrigido**: Campo `yearsOfExperience` agora trata valores vazios corretamente
- ✅ **Implementado**: Validação que converte string vazia para `0`

## 🧪 **Para Testar:**

### **1. Reiniciar Servidor:**
```bash
# Pare o servidor (Ctrl+C) e reinicie
pnpm run dev
```

### **2. Testar Fluxo Completo:**
1. **Acesse**: http://localhost:8080/
2. **Preencha**: Formulário de candidato (sem erros NaN)
3. **Complete**: Questionário até o final
4. **Verifique**: Mensagem de sucesso (sem erro 401)

### **3. Verificar no Console:**
- ✅ **Sem warnings** de NaN
- ✅ **Sem erros 401** do Supabase
- ✅ **Mensagem de sucesso** ao finalizar

### **4. Verificar no Dashboard:**
- **Acesse**: http://localhost:8080/admin
- **Confirme**: Candidato aparece na lista
- **Verifique**: Dados salvos corretamente

## 🔍 **Verificação no Banco:**

```sql
-- Verificar se dados foram salvos
SELECT COUNT(*) FROM candidates;
SELECT COUNT(*) FROM assessments;
SELECT COUNT(*) FROM assessment_answers;

-- Ver dados detalhados
SELECT * FROM candidate_summary;
```

## 🚨 **Se Ainda Houver Problemas:**

### **RLS Muito Restritivo:**
```sql
-- Desabilitar completamente para desenvolvimento
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers DISABLE ROW LEVEL SECURITY;
```

### **Erro de Autenticação:**
- Verifique se as credenciais no `.env.local` estão corretas
- Confirme se o projeto Supabase está ativo

### **Erro de Tipos:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules
pnpm install
```

## 🎯 **Resultado Esperado:**

Após as correções:
1. ✅ **Formulário sem warnings** de NaN
2. ✅ **Salvamento sem erro 401**
3. ✅ **Dados visíveis** no dashboard admin
4. ✅ **Sistema funcionando** completamente

**Execute as correções SQL primeiro, depois teste o sistema! 🚀**
