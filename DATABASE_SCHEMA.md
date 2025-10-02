# 📊 Documentação do Banco de Dados - Sistema KPI

## 📋 Visão Geral

Este documento descreve a estrutura completa do banco de dados do sistema KPI, incluindo todas as tabelas, relacionamentos, campos e constraints.

## 🏗️ Arquitetura do Banco

### 🔑 Tabelas Principais
- **companies**: Empresas/Organizações
- **users**: Usuários do sistema
- **customers**: Clientes
- **vehicles**: Veículos
- **leads**: Leads/Prospects

### 📊 Tabelas de Negócio
- **sales**: Vendas
- **proposals**: Propostas
- **ads**: Anúncios
- **appointments**: Agendamentos
- **service_orders**: Ordens de serviço

### 💰 Tabelas Financeiras
- **accounts**: Contas financeiras
- **transactions**: Transações
- **reconciliations**: Conciliações

### 📋 Tabelas de Suporte
- **parts**: Peças
- **suppliers**: Fornecedores
- **settings**: Configurações

---

## 📋 Detalhamento das Tabelas

### 🏢 **companies**
Tabela principal que armazena informações das empresas/organizações.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `name` | VARCHAR | Nome da empresa | NOT NULL |
| `document` | VARCHAR | Documento (CNPJ) | UNIQUE |
| `email` | VARCHAR | E-mail da empresa | - |
| `phone` | VARCHAR | Telefone | - |
| `address` | TEXT | Endereço completo | - |
| `city` | VARCHAR | Cidade | - |
| `state` | VARCHAR | Estado | - |
| `zip_code` | VARCHAR | CEP | - |
| `cnpj` | VARCHAR | CNPJ (campo adicional) | - |
| `primary_color` | VARCHAR(7) | Cor primária do sistema (HEX) | DEFAULT '#5CBEF5' |
| `secondary_color` | VARCHAR(7) | Cor secundária do sistema (HEX) | DEFAULT '#0C1F2B' |
| `active` | BOOLEAN | Status ativo | DEFAULT true |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 👥 **users**
Usuários do sistema com acesso à plataforma.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `email` | VARCHAR | E-mail do usuário | NOT NULL, UNIQUE |
| `password` | VARCHAR | Senha criptografada | NOT NULL |
| `name` | VARCHAR | Nome completo | NOT NULL |
| `phone` | VARCHAR | Telefone | - |
| `position` | VARCHAR | Cargo/Função | - |
| `department` | VARCHAR | Departamento | - |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `active` | BOOLEAN | Status ativo | DEFAULT true |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 👤 **customers**
Clientes da empresa.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `name` | VARCHAR | Nome do cliente | NOT NULL |
| `email` | VARCHAR | E-mail | - |
| `phone` | VARCHAR | Telefone | - |
| `document` | VARCHAR | CPF/CNPJ | - |
| `address` | TEXT | Endereço | - |
| `city` | VARCHAR | Cidade | - |
| `state` | VARCHAR | Estado | - |
| `zip_code` | VARCHAR | CEP | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 🚗 **vehicles**
Veículos disponíveis para venda.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `brand` | VARCHAR | Marca | NOT NULL |
| `model` | VARCHAR | Modelo | NOT NULL |
| `year` | INTEGER | Ano | NOT NULL |
| `color` | VARCHAR | Cor | - |
| `plate` | VARCHAR | Placa | - |
| `chassis` | VARCHAR | Chassi | - |
| `mileage` | INTEGER | Quilometragem | - |
| `price` | NUMERIC | Preço | - |
| `status` | VARCHAR | Status | DEFAULT 'available' |
| `description` | TEXT | Descrição | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 🎯 **leads**
Leads/Prospects interessados.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `name` | VARCHAR | Nome do lead | NOT NULL |
| `email` | VARCHAR | E-mail | - |
| `phone` | VARCHAR | Telefone | - |
| `source` | VARCHAR | Origem do lead | - |
| `status` | VARCHAR | Status | DEFAULT 'new' |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 💰 **sales**
Vendas realizadas.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `customer_id` | UUID | ID do cliente | FK → customers(id) |
| `vehicle_id` | UUID | ID do veículo | FK → vehicles(id) |
| `user_id` | UUID | ID do vendedor | FK → users(id) |
| `sale_price` | NUMERIC | Preço da venda | NOT NULL |
| `commission` | NUMERIC | Comissão | - |
| `status` | VARCHAR | Status | DEFAULT 'pending' |
| `sale_date` | DATE | Data da venda | - |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 📋 **proposals**
Propostas comerciais.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `vehicle_id` | UUID | ID do veículo | FK → vehicles(id) |
| `user_id` | UUID | ID do vendedor | FK → users(id) |
| `customer_name` | TEXT | Nome do cliente | - |
| `vehicle_description` | TEXT | Descrição do veículo | - |
| `vehicle_price` | NUMERIC | Preço do veículo | - |
| `down_payment` | NUMERIC | Valor da entrada | - |
| `financing_amount` | NUMERIC | Valor financiado | - |
| `installments` | INTEGER | Número de parcelas | - |
| `installment_value` | NUMERIC | Valor da parcela | - |
| `proposal_date` | DATE | Data da proposta | - |
| `status` | VARCHAR | Status | DEFAULT 'pending' |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 📢 **ads**
Anúncios de veículos.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `vehicle_id` | UUID | ID do veículo | FK → vehicles(id) |
| `platform` | VARCHAR | Plataforma (OLX, Webmotors, etc.) | NOT NULL |
| `title` | VARCHAR | Título do anúncio | NOT NULL |
| `description` | TEXT | Descrição | - |
| `price` | NUMERIC | Preço anunciado | - |
| `status` | VARCHAR | Status | DEFAULT 'active' |
| `published_at` | TIMESTAMP | Data de publicação | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 📅 **appointments**
Agendamentos de clientes.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `customer_id` | UUID | ID do cliente | FK → customers(id) |
| `vehicle_id` | UUID | ID do veículo | FK → vehicles(id) |
| `title` | VARCHAR | Título do agendamento | NOT NULL |
| `description` | TEXT | Descrição | - |
| `appointment_date` | DATE | Data do agendamento | NOT NULL |
| `appointment_time` | TIME | Horário | NOT NULL |
| `duration` | INTEGER | Duração em minutos | DEFAULT 60 |
| `status` | VARCHAR | Status | DEFAULT 'scheduled' |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 📝 **attendance_forms**
Formulários de atendimento.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `customer_name` | VARCHAR | Nome do cliente | NOT NULL |
| `email` | VARCHAR | E-mail | - |
| `phone` | VARCHAR | Telefone | - |
| `contact_method` | VARCHAR | Método de contato | - |
| `attraction_media` | VARCHAR | Mídia de atração | - |
| `seller` | VARCHAR | Vendedor | - |
| `type` | VARCHAR | Tipo | - |
| `brand` | VARCHAR | Marca | - |
| `model` | VARCHAR | Modelo | - |
| `year` | INTEGER | Ano | - |
| `vehicle_type` | VARCHAR | Tipo de veículo | - |
| `price_range` | VARCHAR | Faixa de preço | - |
| `queue_brand` | VARCHAR | Marca na fila | - |
| `queue_model` | VARCHAR | Modelo na fila | - |
| `queue_version` | VARCHAR | Versão na fila | - |
| `queue_color` | TEXT | Cor na fila | - |
| `queue_price_from` | TEXT | Preço mínimo na fila | - |
| `queue_price_to` | TEXT | Preço máximo na fila | - |
| `appointment_date` | DATE | Data do agendamento | - |
| `status` | VARCHAR | Status | DEFAULT 'pending' |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 🛠️ **service_orders**
Ordens de serviço.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `customer_id` | UUID | ID do cliente | FK → customers(id) |
| `vehicle_id` | UUID | ID do veículo | FK → vehicles(id) |
| `order_number` | VARCHAR | Número da ordem | NOT NULL |
| `description` | TEXT | Descrição do serviço | - |
| `status` | VARCHAR | Status | DEFAULT 'pending' |
| `total_amount` | NUMERIC | Valor total | - |
| `start_date` | DATE | Data de início | - |
| `end_date` | DATE | Data de fim | - |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 💳 **accounts**
Contas financeiras.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `name` | VARCHAR | Nome da conta | NOT NULL |
| `type` | VARCHAR | Tipo da conta | NOT NULL |
| `category` | VARCHAR | Categoria | - |
| `description` | TEXT | Descrição | - |
| `balance` | NUMERIC | Saldo atual | DEFAULT 0 |
| `active` | BOOLEAN | Status ativo | DEFAULT true |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 💸 **transactions**
Transações financeiras.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `account_id` | UUID | ID da conta | FK → accounts(id) |
| `description` | VARCHAR | Descrição | NOT NULL |
| `amount` | NUMERIC | Valor | NOT NULL |
| `type` | VARCHAR | Tipo (receita/despesa) | NOT NULL |
| `category` | VARCHAR | Categoria | - |
| `transaction_date` | DATE | Data da transação | NOT NULL |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 🔄 **reconciliations**
Conciliações bancárias.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `account_id` | UUID | ID da conta | FK → accounts(id) |
| `statement_balance` | NUMERIC | Saldo do extrato | NOT NULL |
| `book_balance` | NUMERIC | Saldo contábil | NOT NULL |
| `difference` | NUMERIC | Diferença | NOT NULL |
| `reconciliation_date` | DATE | Data da conciliação | NOT NULL |
| `status` | VARCHAR | Status | DEFAULT 'pending' |
| `notes` | TEXT | Observações | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 🔧 **parts**
Peças e componentes.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `supplier_id` | UUID | ID do fornecedor | FK → suppliers(id) |
| `name` | VARCHAR | Nome da peça | NOT NULL |
| `part_number` | VARCHAR | Número da peça | - |
| `description` | TEXT | Descrição | - |
| `category` | VARCHAR | Categoria | - |
| `unit_price` | NUMERIC | Preço unitário | - |
| `stock_quantity` | INTEGER | Quantidade em estoque | DEFAULT 0 |
| `min_stock` | INTEGER | Estoque mínimo | DEFAULT 0 |
| `active` | BOOLEAN | Status ativo | DEFAULT true |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### 🏭 **suppliers**
Fornecedores.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `name` | VARCHAR | Nome do fornecedor | NOT NULL |
| `email` | VARCHAR | E-mail | - |
| `phone` | VARCHAR | Telefone | - |
| `document` | VARCHAR | CNPJ | - |
| `address` | TEXT | Endereço | - |
| `city` | VARCHAR | Cidade | - |
| `state` | VARCHAR | Estado | - |
| `zip_code` | VARCHAR | CEP | - |
| `contact_person` | VARCHAR | Pessoa de contato | - |
| `active` | BOOLEAN | Status ativo | DEFAULT true |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

### ⚙️ **settings**
Configurações do sistema.

| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id` | UUID | Identificador único | PK, DEFAULT gen_random_uuid() |
| `company_id` | UUID | ID da empresa | FK → companies(id) |
| `key` | VARCHAR | Chave da configuração | NOT NULL |
| `value` | TEXT | Valor | - |
| `description` | TEXT | Descrição | - |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | DEFAULT now() |

---

## 🔗 Relacionamentos Principais

### 🏢 **companies** (Tabela Central)
- **1:N** → users, customers, vehicles, leads, sales, proposals, ads, appointments, etc.
- Todas as tabelas principais referenciam `companies.id`

### 👥 **users**
- **N:1** → companies
- **1:N** → sales, proposals (como vendedor)

### 👤 **customers**
- **N:1** → companies
- **1:N** → sales, appointments, service_orders

### 🚗 **vehicles**
- **N:1** → companies
- **1:N** → sales, proposals, ads, appointments, service_orders

### 💰 **sales**
- **N:1** → companies, customers, vehicles, users
- Tabela de junção para vendas

### 📋 **proposals**
- **N:1** → companies, vehicles, users
- Propostas comerciais

---

## 📊 Tabelas de Apoio

### 📎 **appointment_attachments**
Anexos dos formulários de atendimento.

### 📞 **contact_history**
Histórico de contatos.

### 📋 **formalization_*** (4 tabelas)
- **formalization_clients**: Dados dos clientes na formalização
- **formalization_deliveries**: Dados de entrega
- **formalization_payments**: Dados de pagamento
- **formalization_types**: Tipos de formalização

### 👥 **legal_owners** / **possession_owners**
Proprietários legais e de posse.

### 🔍 **vehicle_evaluations**
Avaliações de veículos.

### 🔧 **repair_estimates**
Orçamentos de reparo.

### 🔍 **vehicles_search**
Tabela de busca de veículos.

---

## 🎯 Padrões de Nomenclatura

### 📝 **Convenções**
- **IDs**: UUID com `gen_random_uuid()`
- **Timestamps**: `created_at`, `updated_at` com `DEFAULT now()`
- **Status**: Campos VARCHAR com valores padrão
- **Foreign Keys**: `{tabela}_id` (ex: `company_id`, `user_id`)
- **Booleanos**: `active`, `enabled` com `DEFAULT true`

### 🔑 **Chaves Primárias**
- Todas as tabelas usam UUID como PK
- Exceção: Tabelas de apoio usam INTEGER com `nextval()`

### 🔗 **Foreign Keys**
- Todas referenciam `companies.id` para isolamento multi-tenant
- Relacionamentos bem definidos entre entidades

---

## 🚀 Considerações de Performance

### 📈 **Índices Recomendados**
```sql
-- Índices para consultas frequentes
CREATE INDEX idx_sales_company_date ON sales(company_id, sale_date);
CREATE INDEX idx_customers_company_name ON customers(company_id, name);
CREATE INDEX idx_vehicles_company_status ON vehicles(company_id, status);
CREATE INDEX idx_leads_company_status ON leads(company_id, status);
CREATE INDEX idx_proposals_company_status ON proposals(company_id, status);
```

### 🔍 **Consultas Otimizadas**
- Sempre filtrar por `company_id` para multi-tenancy
- Usar `created_at` para ordenação temporal
- Índices compostos para consultas complexas

---

## 📋 Status e Valores Padrão

### 📊 **Status Comuns**
- **sales.status**: 'pending', 'completed', 'cancelled'
- **proposals.status**: 'pending', 'accepted', 'rejected'
- **ads.status**: 'active', 'paused', 'sold'
- **appointments.status**: 'scheduled', 'completed', 'cancelled'
- **leads.status**: 'new', 'contacted', 'qualified', 'lost'

### 🔄 **Valores Padrão**
- **active**: `DEFAULT true`
- **created_at**: `DEFAULT now()`
- **updated_at**: `DEFAULT now()`
- **balance**: `DEFAULT 0`
- **stock_quantity**: `DEFAULT 0`

---

## 🛡️ Segurança e RLS

### 🔒 **Row Level Security (RLS)**
- Todas as tabelas devem ter RLS habilitado
- Políticas baseadas em `company_id`
- Isolamento completo entre empresas

### 🔐 **Políticas Recomendadas**
```sql
-- Exemplo de política RLS
CREATE POLICY "Users can only see their company data" 
ON sales FOR ALL 
TO authenticated 
USING (company_id = auth.jwt() ->> 'company_id');
```

---

## 📝 Notas de Implementação

### ⚠️ **Atenções**
1. **Multi-tenancy**: Sempre filtrar por `company_id`
2. **UUIDs**: Usar `gen_random_uuid()` para novos registros
3. **Timestamps**: Manter `created_at` e `updated_at` atualizados
4. **Constraints**: Respeitar foreign keys e constraints
5. **RLS**: Implementar políticas de segurança adequadas

### 🔧 **Manutenção**
- Backup regular das tabelas principais
- Monitoramento de performance dos índices
- Limpeza periódica de dados antigos
- Atualização de estatísticas do banco

---

## 🔄 **Versionamento e Manutenção do Schema**

### 📋 **REGRA CRÍTICA - Atualizações do Banco**

> **SEMPRE que houver alteração em qualquer tabela do banco de dados, a documentação DEVE ser atualizada e o SQL ALTER TABLE DEVE ser fornecido**

### 🎯 **Processo Obrigatório**

#### 1️⃣ **Quando Alterar uma Tabela**
- ✅ Adicionar nova coluna
- ✅ Remover coluna existente
- ✅ Modificar tipo de dados
- ✅ Adicionar/remover constraints
- ✅ Criar/remover índices
- ✅ Alterar valores padrão
- ✅ Modificar foreign keys

#### 2️⃣ **Ações Obrigatórias**
1. **📝 Atualizar Documentação**: Modificar `DATABASE_SCHEMA.md`
2. **🔧 Gerar SQL**: Criar script `ALTER TABLE` correspondente
3. **📤 Entregar SQL**: Fornecer o script para execução
4. **📋 Documentar Mudança**: Registrar a alteração

### 📝 **Template de Atualização**

```markdown
## 🔄 **Últimas Alterações**

### 📅 **Data: [DD/MM/AAAA]**
- **Tabela**: `[nome_da_tabela]`
- **Alteração**: `[descrição_da_mudança]`
- **Arquivo SQL**: `[nome_do_arquivo].sql`
- **Status**: `[Pendente/Executado]`
```

### 🔧 **Exemplos de ALTER TABLE**

#### ➕ **Adicionar Coluna**
```sql
-- Exemplo: Adicionar campo 'priority' na tabela leads
ALTER TABLE public.leads 
ADD COLUMN priority VARCHAR DEFAULT 'normal';

COMMENT ON COLUMN public.leads.priority IS 'Prioridade do lead (low, normal, high, urgent)';
```

#### ➖ **Remover Coluna**
```sql
-- Exemplo: Remover campo 'old_field' da tabela customers
ALTER TABLE public.customers 
DROP COLUMN IF EXISTS old_field;
```

#### 🔄 **Modificar Coluna**
```sql
-- Exemplo: Alterar tipo de dados e adicionar constraint
ALTER TABLE public.vehicles 
ALTER COLUMN year TYPE INTEGER,
ALTER COLUMN year SET NOT NULL;
```

#### 🔗 **Adicionar Foreign Key**
```sql
-- Exemplo: Adicionar FK para category_id
ALTER TABLE public.parts 
ADD COLUMN category_id UUID,
ADD CONSTRAINT fk_parts_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id);
```

#### 📊 **Adicionar Índice**
```sql
-- Exemplo: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_sales_company_date_status 
ON public.sales(company_id, sale_date, status);
```

### 📋 **Checklist de Atualização**

#### ✅ **Antes da Alteração**
- [ ] Documentar a necessidade da mudança
- [ ] Verificar impacto em outras tabelas
- [ ] Testar em ambiente de desenvolvimento
- [ ] Gerar script SQL de rollback

#### ✅ **Durante a Alteração**
- [ ] Executar script em ambiente de teste
- [ ] Validar dados após alteração
- [ ] Verificar performance
- [ ] Testar funcionalidades afetadas

#### ✅ **Após a Alteração**
- [ ] Atualizar `DATABASE_SCHEMA.md`
- [ ] Documentar a mudança
- [ ] Notificar equipe de desenvolvimento
- [ ] Atualizar testes automatizados

### 🗂️ **Estrutura de Arquivos SQL**

```
/sql/
├── migrations/
│   ├── 2025-01-15_add_priority_to_leads.sql
│   ├── 2025-01-16_remove_old_field_from_customers.sql
│   └── 2025-01-17_add_index_to_sales.sql
├── rollbacks/
│   ├── 2025-01-15_rollback_priority_from_leads.sql
│   └── 2025-01-16_rollback_remove_old_field.sql
└── documentation/
    └── DATABASE_SCHEMA.md
```

### 📝 **Formato dos Scripts SQL**

#### 🔧 **Script de Migração**
```sql
-- =============================================
-- Migration: [Descrição da alteração]
-- Date: [DD/MM/AAAA]
-- Author: [Nome do desenvolvedor]
-- Description: [Descrição detalhada]
-- =============================================

-- Backup recomendado
-- CREATE TABLE [tabela]_backup_[data] AS SELECT * FROM [tabela];

-- Alteração principal
ALTER TABLE public.[tabela] 
[comando_alteracao];

-- Comentários
COMMENT ON COLUMN public.[tabela].[coluna] IS '[Descrição]';

-- Índices (se necessário)
CREATE INDEX IF NOT EXISTS idx_[tabela]_[coluna] 
ON public.[tabela]([coluna]);

-- Validação
SELECT COUNT(*) FROM public.[tabela] WHERE [condicao_validacao];
```

#### 🔄 **Script de Rollback**
```sql
-- =============================================
-- Rollback: [Descrição da reversão]
-- Date: [DD/MM/AAAA]
-- Author: [Nome do desenvolvedor]
-- Description: [Descrição da reversão]
-- =============================================

-- Reverter alteração
ALTER TABLE public.[tabela] 
[comando_reversao];

-- Remover índices (se necessário)
DROP INDEX IF EXISTS idx_[tabela]_[coluna];

-- Validação
SELECT COUNT(*) FROM public.[tabela] WHERE [condicao_validacao];
```

### 🚨 **Regras de Segurança**

#### ⚠️ **Nunca Fazer**
- ❌ Alterar tabelas em produção sem backup
- ❌ Remover colunas sem verificar dependências
- ❌ Modificar tipos de dados sem validação
- ❌ Executar scripts sem testar primeiro

#### ✅ **Sempre Fazer**
- ✅ Backup antes de qualquer alteração
- ✅ Testar em ambiente de desenvolvimento
- ✅ Documentar todas as mudanças
- ✅ Gerar script de rollback
- ✅ Validar dados após alteração

### 📊 **Controle de Versão**

#### 🔢 **Versionamento do Schema**
- **Versão Atual**: `1.0.0`
- **Formato**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Mudanças que quebram compatibilidade
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções e pequenos ajustes

#### 📅 **Histórico de Alterações**

```markdown
## 📅 **Histórico de Versões**

### 🔢 **v1.0.0** - 15/01/2025
- ✅ Schema inicial do banco de dados
- ✅ 25 tabelas principais criadas
- ✅ Relacionamentos e constraints definidos
- ✅ RLS e políticas de segurança implementadas

### 🔢 **v1.1.0** - [Próxima versão]
- 🔄 [Alterações planejadas]
```

### 📋 **Responsabilidades**

#### 👨‍💻 **Desenvolvedor**
- [ ] Identificar necessidade de alteração
- [ ] Criar script SQL de alteração
- [ ] Testar em ambiente de desenvolvimento
- [ ] Atualizar documentação
- [ ] Solicitar execução em produção

#### 🗄️ **DBA/Administrador**
- [ ] Revisar script SQL
- [ ] Executar backup antes da alteração
- [ ] Executar script em produção
- [ ] Validar integridade dos dados
- [ ] Monitorar performance pós-alteração

#### 📝 **Documentador**
- [ ] Atualizar `DATABASE_SCHEMA.md`
- [ ] Registrar alteração no histórico
- [ ] Atualizar diagramas (se necessário)
- [ ] Comunicar mudanças à equipe

---

## 🔄 **Últimas Alterações**

### 📅 **Data: 15/01/2025**
- **Tabela**: `companies`
- **Alteração**: `Adicionar campos de personalização de cores (primary_color, secondary_color)`
- **Arquivo SQL**: `2025-01-15_add_color_fields_to_companies.sql`
- **Status**: `Pendente`
- **Detalhes**: 
  - Adicionado campo `primary_color VARCHAR(7) DEFAULT '#5CBEF5'`
  - Adicionado campo `secondary_color VARCHAR(7) DEFAULT '#0C1F2B'`
  - Permite personalização visual por empresa
  - Valores padrão em formato HEX
  - Comentários adicionados para documentação
  - Script de rollback disponível

### 📅 **Data: 15/01/2025**
- **Tabela**: `sales, transactions, service_orders, parts, proposals`
- **Alteração**: `DRE 100% com dados reais do banco - remoção completa de dados mock`
- **Arquivo SQL**: `N/A (Apenas consultas)`
- **Status**: `Concluído`
- **Detalhes**: 
  - DRE agora busca dados reais de 5 tabelas: `sales`, `transactions`, `service_orders`, `parts`, `proposals`
  - Receitas: Vendas de veículos, peças, serviços, propostas aceitas, comissões, outras receitas
  - Despesas: Transações de despesa + custo das peças (calculado)
  - Cálculos automáticos de receitas, despesas e margens baseados em dados reais
  - Filtros por período e empresa (multi-tenancy)
  - Remoção completa de dados mock - apenas dados reais do banco
  - Tratamento robusto de erros sem fallback para mock

### 📅 **Data: 15/01/2025**
- **Tabela**: `Nenhuma`
- **Alteração**: `Criação da documentação inicial do banco de dados`
- **Arquivo SQL**: `N/A`
- **Status**: `Concluído`

---

*Documentação gerada automaticamente baseada no schema do banco de dados.*
*Última atualização: Janeiro 2025*
*Versão do Schema: 1.0.0*
