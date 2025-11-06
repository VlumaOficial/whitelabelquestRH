# 📋 Implementação de Aceite de Termos e Política de Privacidade

## 🎯 Objetivo

Adicionar checkbox obrigatório de aceite dos Termos de Uso e Política de Privacidade no formulário de dados pessoais, com links clicáveis que abrem modais para visualização dos documentos. O aceite deve ser registrado no banco de dados com data e hora, e atualizado a cada novo acesso do candidato.

## ✅ Implementação Completa

### 1. **Banco de Dados**

**Arquivo:** `add_terms_acceptance.sql`

Novos campos adicionados à tabela `candidates`:
- `terms_accepted` (BOOLEAN) - Indica se aceitou os Termos de Uso
- `terms_accepted_at` (TIMESTAMP) - Data/hora do aceite dos Termos
- `privacy_policy_accepted` (BOOLEAN) - Indica se aceitou a Política de Privacidade
- `privacy_policy_accepted_at` (TIMESTAMP) - Data/hora do aceite da Política
- `terms_acceptance_ip` (INET) - IP do aceite (para auditoria)

**Como executar:**
```sql
-- Execute no Supabase SQL Editor
-- O script está em: add_terms_acceptance.sql
```

### 2. **Documentos Legais**

**Arquivos criados:**
- `/public/politica-de-privacidade.md` - Política de Privacidade completa (LGPD)
- `/public/termos-de-uso.md` - Termos de Uso detalhados

**Conteúdo inclui:**
- ✅ Conformidade com LGPD
- ✅ Direitos do candidato
- ✅ Uso de dados
- ✅ Segurança e privacidade
- ✅ Contatos para exercer direitos

### 3. **Tipos TypeScript**

**Arquivo:** `src/types/database.ts`

Atualizações:
```typescript
export interface Candidate {
  // ... campos existentes
  terms_accepted: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at?: string;
  terms_acceptance_ip?: string;
}

export interface CandidateFormData {
  // ... campos existentes
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted_at?: string;
  terms_acceptance_ip?: string;
}
```

### 4. **Componente Modal**

**Arquivo:** `src/components/TermsModal.tsx`

Componente reutilizável para exibir documentos:
- ✅ Carrega arquivos `.md` dinamicamente
- ✅ Scroll area para documentos longos
- ✅ Suporta Política de Privacidade e Termos de Uso
- ✅ Design responsivo e acessível

**Uso:**
```tsx
<TermsModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  type="privacy" // ou "terms"
/>
```

### 5. **Formulário de Candidato**

**Arquivo:** `src/components/CandidateForm.tsx`

Implementações:
- ✅ Checkbox obrigatório com validação Zod
- ✅ Links clicáveis para abrir modais
- ✅ Botão desabilitado se não aceitar
- ✅ Mensagem de erro clara
- ✅ Design integrado com tema do projeto

**Validação:**
```typescript
termsAccepted: z.boolean().refine(val => val === true, {
  message: "Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.",
})
```

**UI:**
```
☐ Li e concordo com os [Termos de Uso] e a [Política de Privacidade]
   É necessário aceitar os termos para continuar
```

### 6. **Serviço de Assessment**

**Arquivo:** `src/services/assessmentService.ts`

Atualização do método `createCandidate`:
- ✅ Adiciona timestamps automáticos ao aceitar
- ✅ Atualiza aceite em candidatos existentes
- ✅ Registra data/hora no formato ISO

**Lógica:**
```typescript
const now = new Date().toISOString();
const dataWithTimestamps = {
  ...candidateData,
  terms_accepted_at: candidateData.terms_accepted ? now : null,
  privacy_policy_accepted_at: candidateData.privacy_policy_accepted ? now : null,
};
```

### 7. **Questionário Multi-Step**

**Arquivo:** `src/components/MultiStepQuestionnaire.tsx`

Atualização:
- ✅ Interface aceita `termsAccepted` opcional
- ✅ Passa dados de aceite ao criar candidato
- ✅ Mantém compatibilidade com fluxo existente

## 🔄 Fluxo de Funcionamento

### Novo Candidato:
1. Preenche dados pessoais
2. Clica nos links para ler Termos e Política
3. Marca checkbox de aceite
4. Botão "Continuar" é habilitado
5. Ao submeter, sistema registra:
   - `terms_accepted = true`
   - `privacy_policy_accepted = true`
   - `terms_accepted_at = timestamp atual`
   - `privacy_policy_accepted_at = timestamp atual`

### Candidato Existente (mesmo email):
1. Sistema busca candidato pelo email
2. Atualiza campos de aceite com **novo timestamp**
3. Mantém histórico do aceite mais recente
4. Permite rastreamento de re-aceites

## 🛡️ Conformidade Legal

### LGPD (Lei Geral de Proteção de Dados):
- ✅ Consentimento explícito e informado
- ✅ Finalidade clara do uso de dados
- ✅ Direitos do titular documentados
- ✅ Possibilidade de revogação
- ✅ Registro de data/hora do aceite
- ✅ Transparência no tratamento de dados

### Auditoria:
- ✅ Timestamp de cada aceite
- ✅ Campo para IP (futuro)
- ✅ Histórico de atualizações
- ✅ Rastreabilidade completa

## 📊 Dados Registrados

Para cada aceite, o sistema registra:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `terms_accepted` | BOOLEAN | Se aceitou Termos de Uso |
| `terms_accepted_at` | TIMESTAMP | Quando aceitou Termos |
| `privacy_policy_accepted` | BOOLEAN | Se aceitou Política de Privacidade |
| `privacy_policy_accepted_at` | TIMESTAMP | Quando aceitou Política |
| `terms_acceptance_ip` | INET | IP do aceite (opcional) |

## 🧪 Como Testar

### 1. Executar SQL no Supabase:
```bash
# Copiar conteúdo de add_terms_acceptance.sql
# Colar no SQL Editor do Supabase
# Executar
```

### 2. Testar Novo Candidato:
1. Acessar página inicial
2. Clicar em "Iniciar Jornada"
3. Preencher dados pessoais
4. Verificar que botão está desabilitado
5. Clicar em "Termos de Uso" → Modal abre
6. Clicar em "Política de Privacidade" → Modal abre
7. Marcar checkbox
8. Botão fica habilitado
9. Continuar para questionário
10. Verificar no banco: campos `terms_accepted_at` preenchidos

### 3. Testar Candidato Existente:
1. Usar mesmo email de candidato anterior
2. Aceitar termos novamente
3. Verificar no banco: timestamps atualizados

## 📁 Arquivos Modificados/Criados

### Criados:
- ✅ `add_terms_acceptance.sql`
- ✅ `public/politica-de-privacidade.md`
- ✅ `public/termos-de-uso.md`
- ✅ `src/components/TermsModal.tsx`
- ✅ `TERMS_ACCEPTANCE_IMPLEMENTATION.md`

### Modificados:
- ✅ `src/types/database.ts`
- ✅ `src/components/CandidateForm.tsx`
- ✅ `src/services/assessmentService.ts`
- ✅ `src/components/MultiStepQuestionnaire.tsx`

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras:
1. **Captura de IP:**
   - Adicionar biblioteca para capturar IP do cliente
   - Salvar em `terms_acceptance_ip`

2. **Versionamento de Documentos:**
   - Adicionar campo `terms_version`
   - Rastrear qual versão foi aceita

3. **Histórico de Aceites:**
   - Criar tabela `terms_acceptance_history`
   - Manter histórico completo de todos os aceites

4. **Notificação de Mudanças:**
   - Notificar candidatos quando termos mudarem
   - Solicitar novo aceite

5. **Dashboard Admin:**
   - Visualizar quem aceitou termos
   - Relatórios de conformidade
   - Exportar dados para auditoria

## 📞 Suporte

Para dúvidas sobre a implementação:
- Revisar este documento
- Verificar comentários no código
- Consultar documentação da LGPD

---

**Quest Nós - Mapeamento de Habilidades com Diversidade e Inclusão**

*Implementação em conformidade com LGPD (Lei nº 13.709/2018)*
