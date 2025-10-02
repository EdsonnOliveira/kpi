# 📚 Guia de Componentes - Novo KPI

## 🎯 Objetivo

Este documento serve como guia para desenvolvedores sobre **SEMPRE** usar os componentes já criados no projeto ao invés de criar elementos HTML nativos ou componentes duplicados.

## ⚠️ Regra Fundamental

> **SEMPRE use os componentes existentes antes de criar novos elementos HTML nativos**

## 📦 Componentes Disponíveis

### 🔤 Input Component
**Localização**: `src/components/Input.tsx`

```tsx
import Input from "../components/Input";

// ✅ CORRETO - Use o componente Input
<Input
  label="Nome do Cliente"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
  type="email"
  error={erro}
  helperText="Digite um email válido"
/>

// ❌ INCORRETO - Não use input nativo
<input
  type="text"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
  className="w-full px-3 py-2 border..."
/>
```

**Funcionalidades**:
- ✅ Labels integradas
- ✅ Estados de erro
- ✅ Texto de ajuda
- ✅ Ícones esquerda/direita
- ✅ Datalist para autocomplete
- ✅ Diferentes tamanhos (sm, md, lg)
- ✅ Validação visual automática

### 🔘 Button Component
**Localização**: `src/components/Button.tsx`

```tsx
import Button from "../components/Button";

// ✅ CORRETO - Use o componente Button
<Button
  variant="primary"
  size="md"
  loading={isLoading}
  leftIcon={<SaveIcon />}
  onClick={handleSave}
>
  Salvar
</Button>

// ❌ INCORRETO - Não use button nativo
<button
  className="px-4 py-2 bg-primary text-white rounded-lg..."
  onClick={handleSave}
>
  Salvar
</button>
```

**Variantes disponíveis**:
- `primary` - Botão principal (azul)
- `secondary` - Botão secundário (cinza)
- `success` - Botão de sucesso (verde)
- `danger` - Botão de perigo (vermelho)
- `warning` - Botão de aviso (amarelo)
- `info` - Botão informativo (azul claro)
- `outline` - Botão com borda
- `ghost` - Botão transparente

**Funcionalidades**:
- ✅ Estados de loading
- ✅ Ícones esquerda/direita
- ✅ Diferentes tamanhos
- ✅ Largura total (fullWidth)
- ✅ Estados disabled automáticos

### 📋 Select Component
**Localização**: `src/components/Select.tsx`

```tsx
import Select from "../components/Select";

// ✅ CORRETO - Use o componente Select
<Select
  label="Status"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  error={erro}
>
  <option value="ativo">Ativo</option>
  <option value="inativo">Inativo</option>
</Select>

// ❌ INCORRETO - Não use select nativo
<select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="w-full px-3 py-2 border..."
>
  <option value="ativo">Ativo</option>
</select>
```

**Funcionalidades**:
- ✅ Labels integradas
- ✅ Estados de erro
- ✅ Ícones esquerda
- ✅ Estilo customizado com seta
- ✅ Diferentes tamanhos

### ☑️ Checkbox Component
**Localização**: `src/components/Checkbox.tsx`

```tsx
import Checkbox from "../components/Checkbox";

// ✅ CORRETO - Use o componente Checkbox
<Checkbox
  label="Aceito os termos"
  checked={aceito}
  onChange={(e) => setAceito(e.target.checked)}
  error={erro}
/>

// ❌ INCORRETO - Não use checkbox nativo
<input
  type="checkbox"
  checked={aceito}
  onChange={(e) => setAceito(e.target.checked)}
  className="h-4 w-4 text-primary..."
/>
<label>Aceito os termos</label>
```

**Funcionalidades**:
- ✅ Labels integradas
- ✅ Estados de erro
- ✅ Estilo consistente
- ✅ Cursor pointer automático

### 📝 Textarea Component
**Localização**: `src/components/Textarea.tsx`

```tsx
import Textarea from "../components/Textarea";

// ✅ CORRETO - Use o componente Textarea
<Textarea
  label="Observações"
  value={observacoes}
  onChange={(e) => setObservacoes(e.target.value)}
  rows={4}
  resize="vertical"
/>

// ❌ INCORRETO - Não use textarea nativo
<textarea
  value={observacoes}
  onChange={(e) => setObservacoes(e.target.value)}
  className="w-full px-3 py-2 border..."
  rows={4}
/>
```

**Funcionalidades**:
- ✅ Labels integradas
- ✅ Estados de erro
- ✅ Controle de redimensionamento
- ✅ Diferentes tamanhos
- ✅ Altura mínima automática

## 🎨 Outros Componentes Disponíveis

### 📊 Chart Component
**Localização**: `src/components/Chart.tsx`
- Para gráficos e visualizações de dados

### 📄 ResponsiveCard Component
**Localização**: `src/components/ResponsiveCard.tsx`
- Para cards responsivos

### 🔍 AutocompleteInput Component
**Localização**: `src/components/AutocompleteInput.tsx`
- Para campos com autocomplete

### 📎 Attachment Component
**Localização**: `src/components/Attachment.tsx`
- Para anexos de arquivos

### 📤 FileUpload Component
**Localização**: `src/components/FileUpload.tsx`
- Para upload de arquivos

## 🚀 Benefícios de Usar os Componentes

### ✨ **Consistência Visual**
- Todos os elementos seguem o mesmo padrão de design
- Cores, espaçamentos e tipografia uniformes
- Experiência do usuário consistente

### ⚡ **Funcionalidades Avançadas**
- Estados de loading automáticos
- Validação visual integrada
- Acessibilidade implementada
- Responsividade nativa

### 🔧 **Manutenibilidade**
- Mudanças centralizadas nos componentes
- Fácil atualização de estilos
- Redução de código duplicado
- Testes centralizados

### 📱 **Responsividade**
- Layout adaptável para diferentes telas
- Breakpoints otimizados
- Componentes mobile-first

## 📋 Checklist de Desenvolvimento

Antes de criar qualquer elemento de interface, verifique:

- [ ] ✅ Existe um componente similar já criado?
- [ ] ✅ Posso usar Input ao invés de `<input>`?
- [ ] ✅ Posso usar Button ao invés de `<button>`?
- [ ] ✅ Posso usar Select ao invés de `<select>`?
- [ ] ✅ Posso usar Checkbox ao invés de `<input type="checkbox">`?
- [ ] ✅ Posso usar Textarea ao invés de `<textarea>`?

## 🎯 Exemplos de Refatoração

### ❌ Antes (Código Antigo)
```tsx
// Formulário com elementos nativos
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Nome
    </label>
    <input
      type="text"
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
  
  <button
    onClick={handleSubmit}
    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
  >
    Salvar
  </button>
</div>
```

### ✅ Depois (Código Refatorado)
```tsx
// Formulário com componentes padronizados
import Input from "../components/Input";
import Button from "../components/Button";

<div className="space-y-4">
  <Input
    label="Nome"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
  />
  
  <Button
    variant="primary"
    onClick={handleSubmit}
  >
    Salvar
  </Button>
</div>
```

## 🚨 Quando Criar Novos Componentes

Só crie novos componentes quando:

1. **Não existe funcionalidade similar** nos componentes atuais
2. **É um componente complexo** que será reutilizado em múltiplas páginas
3. **Tem lógica específica** que não se encaixa nos componentes existentes
4. **É aprovado pela equipe** de desenvolvimento

## 📞 Suporte

Se você não encontrar um componente que atenda suas necessidades:

1. **Verifique novamente** a lista de componentes disponíveis
2. **Considere combinar** componentes existentes
3. **Discuta com a equipe** antes de criar um novo componente
4. **Documente** o novo componente seguindo o padrão existente

## 🎯 Conclusão

**Lembre-se**: O objetivo é manter consistência, reduzir duplicação de código e facilitar manutenção. Sempre prefira usar os componentes existentes ao invés de criar elementos HTML nativos ou novos componentes desnecessários.

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0  
**Mantenedor**: Equipe de Desenvolvimento Novo KPI
