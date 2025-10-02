# Atualização da Tabela Attendance Forms

Este documento descreve as alterações realizadas na tabela `attendance_forms` para adicionar os novos campos da seção "Fila de espera".

## Novos Campos Adicionados

### 1. `queue_color` (TEXT)
- **Descrição**: Cor do veículo na fila de espera
- **Tipo**: TEXT (permite valores como "Branco", "Preto", "Prata", etc.)
- **Obrigatório**: Não (nullable)

### 2. `queue_price_from` (TEXT)
- **Descrição**: Valor mínimo da faixa de preço na fila de espera
- **Tipo**: TEXT (formato: "R$ 50.000")
- **Obrigatório**: Não (nullable)

### 3. `queue_price_to` (TEXT)
- **Descrição**: Valor máximo da faixa de preço na fila de espera
- **Tipo**: TEXT (formato: "R$ 100.000")
- **Obrigatório**: Não (nullable)

## Scripts SQL Criados

### 1. `add_queue_fields_to_attendance_forms.sql`
**Propósito**: Adicionar as novas colunas à tabela
**Como executar**:
1. Abra o Supabase SQL Editor
2. Cole o conteúdo do arquivo
3. Execute o script
4. Verifique se não houve erros

### 2. `verify_attendance_forms_structure.sql`
**Propósito**: Verificar se as alterações foram aplicadas corretamente
**Como executar**:
1. Execute após o script de alteração
2. Verifique se todas as colunas foram criadas
3. Opcionalmente, execute o teste de inserção

### 3. `rollback_queue_fields_attendance_forms.sql`
**Propósito**: Reverter as alterações (remover as colunas)
**Como executar**:
1. **ATENÇÃO**: Isso irá perder todos os dados das novas colunas
2. Descomente as linhas `ALTER TABLE ... DROP COLUMN`
3. Execute o script
4. Execute a verificação final

## Ordem de Execução Recomendada

### Para Aplicar as Alterações:
1. Execute `add_queue_fields_to_attendance_forms.sql`
2. Execute `verify_attendance_forms_structure.sql`
3. Teste a aplicação para garantir que tudo funciona

### Para Reverter as Alterações:
1. Execute `rollback_queue_fields_attendance_forms.sql`
2. Execute a verificação final no mesmo script

## Validações Implementadas no Frontend

### Máscara de Moeda
- Os campos `queue_price_from` e `queue_price_to` aplicam automaticamente a máscara de moeda brasileira
- Formato: "R$ 0,00"
- Aplicação em tempo real conforme o usuário digita

### Validação de Faixa de Preço
- Verifica se o valor DE é menor que o valor ATÉ
- Validação em tempo real (visual)
- Validação no momento do submit (impede envio se inválido)
- Mensagem de erro: "O valor DE deve ser menor que o valor ATÉ na fila de espera."

## Compatibilidade

### Registros Existentes
- Todos os registros existentes continuam funcionando normalmente
- Os novos campos são opcionais (nullable)
- Não há quebra de compatibilidade

### Aplicação Frontend
- Interface atualizada com os novos campos
- Validações implementadas
- Máscara de moeda aplicada automaticamente
- Campo Status alterado de Input para Select com opções em português

## Estrutura Final da Seção "Fila de Espera"

```
Fila de espera
├── Marca (AutocompleteInput)
├── Modelo (AutocompleteInput)
├── Versão (AutocompleteInput)
├── Cor (AutocompleteInput) ← NOVO
├── Valor DE (Input com máscara) ← NOVO
└── Valor ATÉ (Input com máscara) ← NOVO
```

## Testes Recomendados

1. **Teste de Inserção**: Criar um novo registro com todos os campos preenchidos
2. **Teste de Validação**: Tentar inserir valor DE maior que valor ATÉ
3. **Teste de Máscara**: Verificar se a formatação de moeda funciona corretamente
4. **Teste de Edição**: Editar um registro existente e adicionar os novos campos
5. **Teste de Busca**: Verificar se os dados são salvos e recuperados corretamente

## Suporte

Em caso de problemas:
1. Verifique os logs do Supabase SQL Editor
2. Execute o script de verificação
3. Se necessário, use o script de rollback
4. Entre em contato com a equipe de desenvolvimento

