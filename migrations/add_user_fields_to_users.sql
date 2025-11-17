ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS admission_date DATE,
ADD COLUMN IF NOT EXISTS salary NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS work_schedule JSONB;

COMMENT ON COLUMN users.birth_date IS 'Data de nascimento do usuário';
COMMENT ON COLUMN users.admission_date IS 'Data de admissão do usuário';
COMMENT ON COLUMN users.salary IS 'Salário do usuário';
COMMENT ON COLUMN users.work_schedule IS 'Escala de trabalho do usuário (array de objetos com dia da semana, hora inicial e hora final)';

