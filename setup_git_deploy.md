# 🚀 Setup Git e Deploy no Vercel

## ❌ **Problema Identificado:**
Git não está instalado no sistema Windows.

## ✅ **Solução - Passo a Passo:**

### **📋 Passo 1: Instalar Git**
1. **Baixar Git**: https://git-scm.com/download/win
2. **Executar instalador** com configurações padrão
3. **Reiniciar terminal** após instalação

### **📋 Passo 2: Configurar Git (após instalação)**
```bash
# Configurar usuário
git config --global user.name "Vluma Oficial"
git config --global user.email "contato@vluma.com.br"

# Verificar configuração
git config --list
```

### **📋 Passo 3: Preparar Repositório**
```bash
# Navegar para o projeto
cd "c:\Users\sdore\dyad-apps\Quest Nos"

# Verificar status
git status

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "feat: sistema Quest Nós completo para deploy"

# Configurar remote (se não existir)
git remote add origin https://github.com/VlumaOficial/questnos.git

# Verificar remote
git remote -v
```

### **📋 Passo 4: Autenticar com Token**
```bash
# Configurar token como credential
git config --global credential.helper store

# No primeiro push, usar:
# Username: VlumaOficial
# Password: [SEU_TOKEN_GITHUB_AQUI]
```

### **📋 Passo 5: Push para GitHub**
```bash
# Push inicial
git push -u origin main

# Ou se a branch for master:
git push -u origin master
```

### **📋 Passo 6: Deploy no Vercel**
1. **Acessar**: https://vercel.com
2. **Conectar GitHub**: Autorizar acesso ao repositório
3. **Import Project**: Selecionar `questnos`
4. **Configure**:
   - Framework: `Vite`
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_supabase
   ```

## 🔧 **Arquivos Importantes para Deploy:**

### **vercel.json** (já existe):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **.env.example** (para referência):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 🎯 **Próximos Passos:**
1. **Instalar Git** primeiro
2. **Executar comandos** na ordem
3. **Configurar Vercel** com variáveis de ambiente
4. **Testar deploy** no ambiente de produção

## ⚠️ **Importante:**
- **Não commitar** arquivos `.env.local` (já está no .gitignore)
- **Configurar variáveis** no Vercel Dashboard
- **Testar localmente** antes do deploy: `pnpm run build && pnpm run preview`

**Instale o Git primeiro, depois execute os comandos! 🚀**
