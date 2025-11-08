-- Adicionar campos de Dados de Cliente e Dados do Cliente Legal na tabela vehicles
-- Data: 2025-01-XX

-- Dados de Cliente (Pessoa Física)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS customer_name VARCHAR,
ADD COLUMN IF NOT EXISTS customer_cpf VARCHAR,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR,
ADD COLUMN IF NOT EXISTS customer_birth_date DATE,
ADD COLUMN IF NOT EXISTS customer_zip_code VARCHAR,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_city VARCHAR,
ADD COLUMN IF NOT EXISTS customer_state VARCHAR;

-- Dados do Cliente Legal (Pessoa Jurídica)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS legal_customer_name VARCHAR,
ADD COLUMN IF NOT EXISTS legal_customer_cnpj VARCHAR,
ADD COLUMN IF NOT EXISTS legal_customer_email VARCHAR,
ADD COLUMN IF NOT EXISTS legal_customer_phone VARCHAR,
ADD COLUMN IF NOT EXISTS legal_customer_zip_code VARCHAR,
ADD COLUMN IF NOT EXISTS legal_customer_address TEXT,
ADD COLUMN IF NOT EXISTS legal_customer_city VARCHAR,
ADD COLUMN IF NOT EXISTS legal_customer_state VARCHAR;

