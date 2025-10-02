import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cvfacwfkbcgmnfuqorky.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzEzNzYsImV4cCI6MjA3NDY0NzM3Nn0.Eaxp52JjABWSioY4z4TSBHIf7Nom9AWAN9KLVAqftLE'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmFjd2ZrYmNnbW5mdXFvcmt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA3MTM3NiwiZXhwIjoyMDc0NjQ3Mzc2fQ.quH0Ftkakm7JxUcnTxHVm1y-8yXjq6yR8pcb4lf5IDA'

// Cliente para uso no frontend (com chave anônima)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso no backend (com chave de serviço)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
