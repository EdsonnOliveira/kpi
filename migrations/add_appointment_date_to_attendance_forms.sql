-- =============================================
-- Migration: Garantir que o campo appointment_date existe na tabela attendance_forms
-- Date: 2025
-- Description: Adiciona o campo appointment_date caso não exista
-- =============================================

ALTER TABLE attendance_forms
ADD COLUMN IF NOT EXISTS appointment_date DATE;

COMMENT ON COLUMN attendance_forms.appointment_date IS 'Data do agendamento do atendimento (quando o cliente será atendido)';

-- Verificação: Verificar se a coluna foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attendance_forms' 
  AND column_name = 'appointment_date';

