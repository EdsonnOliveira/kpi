# Configuração de Anexos - Sistema KPI

## Visão Geral

Este documento descreve como configurar e usar o sistema de anexos implementado para as seções de "Fotos de Documentos", "Fotos da Avaliação" e "Fotos do Anúncio" na página de appointment.

## Funcionalidades Implementadas

### ✅ Upload de Arquivos
- Upload múltiplo de arquivos
- Suporte a imagens, PDFs e documentos
- Validação de tipos de arquivo
- Geração de nomes únicos para evitar conflitos

### ✅ Armazenamento
- Arquivos salvos no Supabase Storage
- Metadados salvos no banco de dados PostgreSQL
- URLs públicas para acesso aos arquivos

### ✅ Interface do Usuário
- Botões "Adicionar Anexo" funcionais
- Lista de anexos com ações (visualizar, download, excluir)
- Estados de carregamento durante upload
- Mensagens de feedback para o usuário

### ✅ Gerenciamento de Arquivos
- Carregamento automático de anexos existentes
- Exclusão de arquivos (storage + banco de dados)
- Organização por tipo (documentos, avaliação, anúncio)

## Configuração Necessária

### 1. Criar Bucket no Supabase Storage

No painel do Supabase, vá para **Storage** e crie um bucket chamado `attachments`:

```sql
-- No SQL Editor do Supabase, execute:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true);
```

### 2. Configurar Políticas de Storage

Execute as seguintes políticas para permitir upload e download:

```sql
-- Política para permitir upload
CREATE POLICY "Users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

-- Política para permitir download
CREATE POLICY "Users can download attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);

-- Política para permitir exclusão
CREATE POLICY "Users can delete attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' AND
  auth.role() = 'authenticated'
);
```

### 3. Criar Tabela de Metadados

Execute o script SQL fornecido:

```bash
# Execute o arquivo create_attachments_table.sql no SQL Editor do Supabase
```

## Estrutura de Arquivos

### Componentes Criados

1. **FileUpload.tsx** - Componente para seleção de arquivos
2. **fileUpload.ts** - Serviço para gerenciar uploads
3. **create_attachments_table.sql** - Script de criação da tabela

### Modificações

1. **appointment.tsx** - Adicionada funcionalidade de upload nas três seções

## Como Usar

### Para o Usuário

1. **Adicionar Anexos:**
   - Clique no botão "Adicionar Anexo" na seção desejada
   - Selecione um ou mais arquivos
   - Aguarde o upload ser concluído

2. **Visualizar Anexos:**
   - Clique em "Visualizar" para abrir o arquivo em nova aba
   - Clique em "Download" para baixar o arquivo

3. **Remover Anexos:**
   - Clique em "Excluir" para remover o anexo

### Tipos de Arquivo Suportados

- **Imagens:** JPG, JPEG, PNG, GIF
- **Documentos:** PDF, DOC, DOCX
- **Outros:** Qualquer tipo de arquivo

## Estrutura do Banco de Dados

### Tabela: appointment_attachments

```sql
CREATE TABLE appointment_attachments (
    id UUID PRIMARY KEY,
    appointment_id UUID NOT NULL,  -- UUID para compatibilidade com attendance_forms
    company_id UUID NOT NULL,      -- UUID para compatibilidade com companies
    attachment_type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    public_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID                -- UUID para compatibilidade com users
);
```

### Tipos de Anexo

- `documentos` - Fotos de documentos
- `avaliacao` - Fotos da avaliação
- `anuncio` - Fotos do anúncio
- `cnh` - CNH do cliente
- `rg` - RG do cliente
- `documento1` - Documento 1 do cliente
- `documento2` - Documento 2 do cliente

## Estrutura do Storage

```
attachments/
└── appointments/
    └── {appointment_id}/
        ├── documentos/
        │   └── {timestamp}_{random}.{ext}
        ├── avaliacao/
        │   └── {timestamp}_{random}.{ext}
        ├── anuncio/
        │   └── {timestamp}_{random}.{ext}
        ├── cnh/
        │   └── {timestamp}_{random}.{ext}
        ├── rg/
        │   └── {timestamp}_{random}.{ext}
        ├── documento1/
        │   └── {timestamp}_{random}.{ext}
        └── documento2/
            └── {timestamp}_{random}.{ext}
```

## Segurança

- **RLS (Row Level Security)** habilitado
- Usuários só podem acessar anexos da própria empresa
- Validação de autenticação em todas as operações
- Nomes de arquivo únicos para evitar conflitos

## Troubleshooting

### Problemas Comuns

1. **Erro de upload:**
   - Verifique se o bucket `attachments` existe
   - Confirme as políticas de storage
   - Verifique se o usuário está autenticado

2. **Arquivos não aparecem:**
   - Execute o script de criação da tabela
   - Verifique as políticas RLS
   - Confirme se o `company_id` está correto

3. **Erro de permissão:**
   - Verifique se o usuário tem acesso à empresa
   - Confirme as políticas de storage
   - Verifique se o token de autenticação é válido

### Logs Úteis

Os logs de erro são exibidos no console do navegador. Verifique:
- Erros de upload no storage
- Erros de inserção no banco de dados
- Problemas de autenticação

## Próximos Passos

1. **Testar a funcionalidade** com diferentes tipos de arquivo
2. **Configurar backup** dos arquivos no storage
3. **Implementar compressão** de imagens se necessário
4. **Adicionar validação** de tamanho máximo de arquivo
5. **Implementar preview** de imagens na interface
