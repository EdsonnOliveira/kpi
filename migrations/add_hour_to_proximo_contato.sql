-- =============================================
-- Migration: Adicionar suporte a hora no campo proximo_contato
-- Date: 15/01/2025
-- Description: Altera o campo proximo_contato de DATE para TIMESTAMP para suportar data e hora
-- =============================================

-- Backup recomendado (executar antes da alteração)
-- CREATE TABLE contact_history_backup_20250115 AS SELECT * FROM contact_history;

-- Alterar o tipo do campo proximo_contato de DATE para TIMESTAMP
ALTER TABLE public.contact_history 
ALTER COLUMN proximo_contato TYPE TIMESTAMP USING 
  CASE 
    WHEN proximo_contato IS NULL THEN NULL
    WHEN proximo_contato::text ~ '^\d{4}-\d{2}-\d{2}$' THEN (proximo_contato::text || ' 00:00:00')::TIMESTAMP
    ELSE proximo_contato::TIMESTAMP
  END;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.contact_history.proximo_contato IS 'Data e hora do próximo contato agendado (opcional)';

-- Validação: Verificar se a alteração foi aplicada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'contact_history' 
  AND column_name = 'proximo_contato';

