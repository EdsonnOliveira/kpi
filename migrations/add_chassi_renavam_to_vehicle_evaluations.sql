-- =============================================
-- Migration: Adicionar campos Chassi e RENAVAM na tabela vehicle_evaluations
-- Date: 15/01/2025
-- Description: Adiciona campos obrigatórios de identificação do veículo (chassi e renavam)
-- =============================================

-- Backup recomendado (executar antes da alteração)
-- CREATE TABLE vehicle_evaluations_backup_20250115 AS SELECT * FROM vehicle_evaluations;

-- =============================================
-- Tabela: vehicle_evaluations
-- =============================================

-- Adicionar campo Chassi
ALTER TABLE public.vehicle_evaluations 
ADD COLUMN IF NOT EXISTS chassis VARCHAR(17);

-- Adicionar campo RENAVAM
ALTER TABLE public.vehicle_evaluations 
ADD COLUMN IF NOT EXISTS renavam VARCHAR(11);

-- Comentários para documentação
COMMENT ON COLUMN public.vehicle_evaluations.chassis IS 'Número do chassi do veículo (obrigatório)';
COMMENT ON COLUMN public.vehicle_evaluations.renavam IS 'Número do RENAVAM do veículo (obrigatório)';

-- Validação: Verificar se as alterações foram aplicadas corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicle_evaluations' 
  AND column_name IN ('chassis', 'renavam')
ORDER BY column_name;

