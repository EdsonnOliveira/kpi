-- =============================================
-- Migration: Adicionar campos de endereço completo e CNPJ para proprietários
-- Date: 15/01/2025
-- Description: Adiciona suporte a CNPJ, inscrição estadual e endereço completo nas tabelas legal_owners e possession_owners
-- =============================================

-- Backup recomendado (executar antes da alteração)
-- CREATE TABLE legal_owners_backup_20250115 AS SELECT * FROM legal_owners;
-- CREATE TABLE possession_owners_backup_20250115 AS SELECT * FROM possession_owners;

-- =============================================
-- Tabela: legal_owners
-- =============================================

-- Adicionar campo CNPJ
ALTER TABLE public.legal_owners 
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14);

-- Adicionar campo Inscrição Estadual
ALTER TABLE public.legal_owners 
ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(50);

-- Adicionar campo Número do endereço
ALTER TABLE public.legal_owners 
ADD COLUMN IF NOT EXISTS number VARCHAR(20);

-- Adicionar campo Complemento
ALTER TABLE public.legal_owners 
ADD COLUMN IF NOT EXISTS complement VARCHAR(100);

-- Adicionar campo Bairro
ALTER TABLE public.legal_owners 
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- Adicionar campo Cidade
ALTER TABLE public.legal_owners 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Comentários para documentação
COMMENT ON COLUMN public.legal_owners.cnpj IS 'CNPJ do proprietário legal (quando pessoa jurídica)';
COMMENT ON COLUMN public.legal_owners.inscricao_estadual IS 'Inscrição Estadual (opcional, apenas para CNPJ)';
COMMENT ON COLUMN public.legal_owners.number IS 'Número do endereço';
COMMENT ON COLUMN public.legal_owners.complement IS 'Complemento do endereço (apto, bloco, etc.)';
COMMENT ON COLUMN public.legal_owners.neighborhood IS 'Bairro';
COMMENT ON COLUMN public.legal_owners.city IS 'Cidade';

-- =============================================
-- Tabela: possession_owners
-- =============================================

-- Adicionar campo CNPJ
ALTER TABLE public.possession_owners 
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14);

-- Adicionar campo Inscrição Estadual
ALTER TABLE public.possession_owners 
ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(50);

-- Adicionar campo Número do endereço
ALTER TABLE public.possession_owners 
ADD COLUMN IF NOT EXISTS number VARCHAR(20);

-- Adicionar campo Complemento
ALTER TABLE public.possession_owners 
ADD COLUMN IF NOT EXISTS complement VARCHAR(100);

-- Adicionar campo Bairro
ALTER TABLE public.possession_owners 
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- Adicionar campo Cidade
ALTER TABLE public.possession_owners 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Comentários para documentação
COMMENT ON COLUMN public.possession_owners.cnpj IS 'CNPJ do proprietário de posse (quando pessoa jurídica)';
COMMENT ON COLUMN public.possession_owners.inscricao_estadual IS 'Inscrição Estadual (opcional, apenas para CNPJ)';
COMMENT ON COLUMN public.possession_owners.number IS 'Número do endereço';
COMMENT ON COLUMN public.possession_owners.complement IS 'Complemento do endereço (apto, bloco, etc.)';
COMMENT ON COLUMN public.possession_owners.neighborhood IS 'Bairro';
COMMENT ON COLUMN public.possession_owners.city IS 'Cidade';

-- Validação: Verificar se as alterações foram aplicadas corretamente
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('legal_owners', 'possession_owners')
  AND column_name IN ('cnpj', 'inscricao_estadual', 'number', 'complement', 'neighborhood', 'city')
ORDER BY table_name, column_name;

