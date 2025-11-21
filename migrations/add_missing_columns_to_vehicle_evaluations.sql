-- =============================================
-- Migration: Adicionar colunas faltantes na tabela vehicle_evaluations
-- Date: 2025
-- Description: Adiciona colunas que faltam na tabela vehicle_evaluations existente
-- =============================================

-- Adicionar colunas que podem não existir
ALTER TABLE public.vehicle_evaluations
ADD COLUMN IF NOT EXISTS customer_name VARCHAR,
ADD COLUMN IF NOT EXISTS seller VARCHAR,
ADD COLUMN IF NOT EXISTS category VARCHAR,
ADD COLUMN IF NOT EXISTS version VARCHAR,
ADD COLUMN IF NOT EXISTS expenses NUMERIC(10, 2);

-- Adicionar comentários nas colunas
COMMENT ON COLUMN public.vehicle_evaluations.customer_name IS 'Nome do cliente';
COMMENT ON COLUMN public.vehicle_evaluations.seller IS 'Nome do vendedor';
COMMENT ON COLUMN public.vehicle_evaluations.category IS 'Categoria do veículo';
COMMENT ON COLUMN public.vehicle_evaluations.version IS 'Versão do veículo';
COMMENT ON COLUMN public.vehicle_evaluations.expenses IS 'Despesa total (soma das previsões de reparo)';

-- Verificação: Verificar se as colunas foram criadas corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicle_evaluations'
  AND column_name IN ('customer_name', 'seller', 'category', 'version', 'expenses')
ORDER BY ordinal_position;

