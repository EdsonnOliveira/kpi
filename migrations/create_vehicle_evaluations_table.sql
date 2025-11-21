-- =============================================
-- Migration: Criar tabela vehicle_evaluations para múltiplas avaliações
-- Date: 2025
-- Description: Cria tabela para armazenar múltiplas avaliações de veículos por appointment
-- =============================================

CREATE TABLE IF NOT EXISTS public.vehicle_evaluations (
  id SERIAL PRIMARY KEY,
  appointment_id VARCHAR NOT NULL,
  company_id UUID NOT NULL,
  customer_name VARCHAR,
  seller VARCHAR,
  category VARCHAR,
  version VARCHAR,
  brand VARCHAR,
  model VARCHAR,
  year INTEGER,
  color VARCHAR,
  plate VARCHAR,
  chassis VARCHAR(17),
  renavam VARCHAR(11),
  cheapest_price NUMERIC(10, 2),
  fipe_price NUMERIC(10, 2),
  expensive_price NUMERIC(10, 2),
  average_price NUMERIC(10, 2),
  evaluation_price NUMERIC(10, 2),
  expenses NUMERIC(10, 2),
  cost_estimate NUMERIC(10, 2),
  doors INTEGER,
  seats INTEGER,
  value NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_vehicle_evaluations_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Adicionar comentários
COMMENT ON TABLE public.vehicle_evaluations IS 'Avaliações de veículos vinculadas a formulários de atendimento';
COMMENT ON COLUMN public.vehicle_evaluations.appointment_id IS 'ID do formulário de atendimento (attendance_forms)';
COMMENT ON COLUMN public.vehicle_evaluations.customer_name IS 'Nome do cliente';
COMMENT ON COLUMN public.vehicle_evaluations.seller IS 'Nome do vendedor';
COMMENT ON COLUMN public.vehicle_evaluations.category IS 'Categoria do veículo';
COMMENT ON COLUMN public.vehicle_evaluations.version IS 'Versão do veículo';
COMMENT ON COLUMN public.vehicle_evaluations.evaluation_price IS 'Valor da avaliação';
COMMENT ON COLUMN public.vehicle_evaluations.expenses IS 'Despesa total (soma das previsões de reparo)';
COMMENT ON COLUMN public.vehicle_evaluations.cost_estimate IS 'Previsão de custo total';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_evaluations_appointment ON public.vehicle_evaluations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_evaluations_company ON public.vehicle_evaluations(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_evaluations_created ON public.vehicle_evaluations(created_at DESC);

-- Verificação: Verificar se a tabela foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'vehicle_evaluations'
ORDER BY ordinal_position;

