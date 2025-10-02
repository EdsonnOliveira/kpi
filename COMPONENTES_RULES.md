# 🚨 Regras de Componentes - Novo KPI

## ⚠️ REGRA FUNDAMENTAL

> **SEMPRE use os componentes existentes. NUNCA crie elementos HTML nativos.**

### 🔴 REGRA CRÍTICA - BOTÕES

> **TODOS os botões DEVEM usar o componente `<Button>`. NUNCA use `<button>` HTML nativo.**

### 🇧🇷 REGRA CRÍTICA - FORMATAÇÃO DE DATAS

> **TODAS as datas DEVEM ser exibidas no formato brasileiro: dd/mm/yyyy**

### 💰 REGRA CRÍTICA - MÁSCARAS DE VALORES

> **TODOS os inputs que exibem VALORES ou PORCENTAGENS DEVEM ter máscara aplicada**

### 📋 REGRA CRÍTICA - MÁSCARAS DE DOCUMENTOS

> **TODOS os inputs que exibem CPF, CEP ou CNPJ DEVEM ter máscara aplicada**

### 🎯 REGRA CRÍTICA - POSICIONAMENTO DE BOTÕES

> **Em páginas de edição, os botões de ação (Salvar/Cancelar) DEVEM ficar no HEADER, não no final da página**

## 📦 Componentes Obrigatórios

### ❌ NUNCA FAÇA ISSO:
```tsx
// ❌ Input nativo
<input className="w-full px-3 py-2 border..." />

// ❌ Button nativo - PROIBIDO!
<button className="px-4 py-2 bg-primary..." />
<button onClick={handleClick}>Clique aqui</button>
<button type="submit">Enviar</button>

// ❌ Select nativo
<select className="w-full px-3 py-2 border..." />

// ❌ Checkbox nativo
<input type="checkbox" className="h-4 w-4..." />

// ❌ Textarea nativo
<textarea className="w-full px-3 py-2 border..." />

// ❌ Data em formato americano - PROIBIDO!
<p>{new Date().toISOString()}</p>
<p>{date.toLocaleDateString('en-US')}</p>
<p>{date.toDateString()}</p>

// ❌ Input de valor sem máscara - PROIBIDO!
<Input label="Valor" value={valor} onChange={setValor} />
<Input label="Preço" value={preco} onChange={setPreco} />
<Input label="Comissão" value={comissao} onChange={setComissao} />
<Input label="Margem" value={margem} onChange={setMargem} />

// ❌ Input de documento sem máscara - PROIBIDO!
<Input label="CPF" value={cpf} onChange={setCpf} />
<Input label="CEP" value={cep} onChange={setCep} />
<Input label="CNPJ" value={cnpj} onChange={setCnpj} />

// ❌ Botões de ação no final da página - PROIBIDO!
<div className="mt-8">
  <div className="flex justify-end space-x-4">
    <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
    <Button variant="primary" onClick={handleSave}>Salvar</Button>
  </div>
</div>
```

### ✅ SEMPRE FAÇA ISSO:
```tsx
// ✅ Use os componentes
import Input from "../components/Input";
import Button from "../components/Button";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import Textarea from "../components/Textarea";

<Input label="Nome" value={nome} onChange={setNome} />

// ✅ Botões com componente Button
<Button variant="primary" onClick={handleSave}>Salvar</Button>
<Button variant="outline" onClick={handleCancel}>Cancelar</Button>
<Button variant="secondary" onClick={handleEdit} leftIcon={<EditIcon />}>
  Editar
</Button>
<Button variant="danger" onClick={handleDelete}>Excluir</Button>

<Select label="Status" value={status} onChange={setStatus}>
  <option value="ativo">Ativo</option>
</Select>
<Checkbox label="Aceito" checked={aceito} onChange={setAceito} />
<Textarea label="Observações" value={obs} onChange={setObs} />

// ✅ Datas no formato brasileiro (dd/mm/yyyy)
const formatDateBR = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

<p>{formatDateBR(saleDetails.sale_date)}</p>
<p>{formatDateBR(saleDetails.created_at)}</p>

// ✅ Inputs de valor COM máscara
import { applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";

<Input
  label="Valor da Venda"
  value={salePrice ? applyCurrencyMask(salePrice.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setSalePrice(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Comissão"
  value={commission ? applyCurrencyMask(commission.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setCommission(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Margem (%)"
  value={margin ? `${margin}%` : '0%'}
  onChange={(e) => {
    const numericValue = e.target.value.replace('%', '');
    setMargin(parseFloat(numericValue) || 0);
  }}
/>

// ✅ Inputs de documento COM máscara
import { applyCpfMask, removeCpfMask, applyCepMask, removeCepMask, applyCnpjMask, removeCnpjMask } from "../lib/formatting";

<Input
  label="CPF"
  value={cpf ? applyCpfMask(cpf) : ''}
  onChange={(e) => {
    const cleanValue = removeCpfMask(e.target.value);
    setCpf(cleanValue);
  }}
  placeholder="000.000.000-00"
/>

<Input
  label="CEP"
  value={cep ? applyCepMask(cep) : ''}
  onChange={(e) => {
    const cleanValue = removeCepMask(e.target.value);
    setCep(cleanValue);
  }}
  placeholder="00000-000"
/>

<Input
  label="CNPJ"
  value={cnpj ? applyCnpjMask(cnpj) : ''}
  onChange={(e) => {
    const cleanValue = removeCnpjMask(e.target.value);
    setCnpj(cleanValue);
  }}
  placeholder="00.000.000/0000-00"
/>

// ✅ Botões de ação no HEADER - CORRETO!
<div className="mb-8">
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Editar Item</h2>
      <p className="text-gray-600">Descrição do item</p>
    </div>
    <div className="flex space-x-3">
      <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
      <Button variant="primary" onClick={handleSave}>Salvar</Button>
    </div>
  </div>
</div>
```

## 🎯 Checklist Obrigatório

Antes de qualquer commit, verifique:

- [ ] ✅ Não usei `<input>` - usei `Input`
- [ ] ✅ **NÃO usei `<button>` - usei `Button`** 🔴 CRÍTICO
- [ ] ✅ Não usei `<select>` - usei `Select`
- [ ] ✅ Não usei `<input type="checkbox">` - usei `Checkbox`
- [ ] ✅ Não usei `<textarea>` - usei `Textarea`
- [ ] ✅ Importei todos os componentes necessários
- [ ] ✅ Usei as props corretas de cada componente
- [ ] ✅ **Todos os botões usam componente `<Button>`** 🔴 CRÍTICO
- [ ] ✅ **Todas as datas estão no formato brasileiro (dd/mm/yyyy)** 🇧🇷 CRÍTICO
- [ ] ✅ **Todos os inputs de VALOR e PORCENTAGEM têm máscara** 💰 CRÍTICO
- [ ] ✅ **Todos os inputs de SALDO usam type="text" com máscara** 🏦 CRÍTICO
- [ ] ✅ **Todos os inputs de CPF, CEP e CNPJ têm máscara** 📋 CRÍTICO
- [ ] ✅ **Botões de ação estão no HEADER, não no final** 🎯 CRÍTICO

## 🚨 Penalidades

**Código com elementos HTML nativos será REJEITADO em code review.**

### 🔴 Penalidade Especial para Botões

**Qualquer uso de `<button>` HTML nativo resultará em REJEIÇÃO IMEDIATA do PR.**

### 🇧🇷 Penalidade Especial para Datas

**Qualquer data exibida em formato americano (mm/dd/yyyy) ou ISO resultará em REJEIÇÃO IMEDIATA do PR.**

### 💰 Penalidade Especial para Máscaras de Valores

**Qualquer input de valor ou porcentagem sem máscara resultará em REJEIÇÃO IMEDIATA do PR.**

### 🏦 Penalidade Especial para Inputs de Saldo

**Qualquer input de saldo (Saldo do Extrato, Saldo Contábil, etc.) sem máscara ou com `type="number"` resultará em REJEIÇÃO IMEDIATA do PR.**

### 📋 Penalidade Especial para Máscaras de Documentos

**Qualquer input de CPF, CEP ou CNPJ sem máscara resultará em REJEIÇÃO IMEDIATA do PR.**

### 🎯 Penalidade Especial para Posicionamento de Botões

**Qualquer página de edição com botões de ação no final da página resultará em REJEIÇÃO IMEDIATA do PR.**

## 📞 Ajuda

Se não souber qual componente usar, consulte:
- `COMPONENTES_GUIDE.md` - Guia completo
- `src/components/` - Código dos componentes
- Equipe de desenvolvimento

## 🔴 SEÇÃO ESPECIAL - BOTÕES

### ⚠️ REGRA ABSOLUTA
**TODOS os botões DEVEM usar o componente `<Button>`. SEM EXCEÇÕES.**

### 🎯 Variantes Disponíveis
```tsx
<Button variant="primary">Botão Principal</Button>
<Button variant="secondary">Botão Secundário</Button>
<Button variant="outline">Botão Outline</Button>
<Button variant="danger">Botão de Perigo</Button>
<Button variant="ghost">Botão Fantasma</Button>
```

### 🎨 Props Disponíveis
```tsx
<Button 
  variant="primary"
  onClick={handleClick}
  disabled={isLoading}
  loading={isLoading}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  size="sm" | "md" | "lg"
>
  Texto do Botão
</Button>
```

### ❌ EXEMPLOS PROIBIDOS
```tsx
// ❌ NUNCA faça isso:
<button onClick={handleClick}>Clique</button>
<button className="btn-primary">Salvar</button>
<button type="submit">Enviar</button>
<input type="button" value="Botão" />
```

### ✅ EXEMPLOS CORRETOS
```tsx
// ✅ Sempre faça isso:
<Button variant="primary" onClick={handleClick}>Clique</Button>
<Button variant="primary">Salvar</Button>
<Button variant="primary" type="submit">Enviar</Button>
<Button variant="primary">Botão</Button>
```

## 🇧🇷 SEÇÃO ESPECIAL - FORMATAÇÃO DE DATAS

### ⚠️ REGRA ABSOLUTA
**TODAS as datas DEVEM ser exibidas no formato brasileiro: dd/mm/yyyy**

### 🎯 Função Padrão
```tsx
// ✅ Use sempre esta função para formatar datas
const formatDateBR = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};
```

### 📅 Exemplos de Uso
```tsx
// ✅ Formatação correta
<p>Data da Venda: {formatDateBR(saleDetails.sale_date)}</p>
<p>Criado em: {formatDateBR(saleDetails.created_at)}</p>
<p>Atualizado em: {formatDateBR(saleDetails.updated_at)}</p>
<p>Próximo contato: {formatDateBR(saleDetails.next_contact_date)}</p>
```

### ❌ EXEMPLOS PROIBIDOS
```tsx
// ❌ NUNCA faça isso:
<p>{new Date().toISOString()}</p>                    // 2024-01-15T10:30:00.000Z
<p>{date.toLocaleDateString('en-US')}</p>           // 1/15/2024
<p>{date.toDateString()}</p>                        // Mon Jan 15 2024
<p>{date.toLocaleDateString()}</p>                  // Formato do sistema (pode variar)
<p>{saleDetails.sale_date}</p>                      // Formato do banco (YYYY-MM-DD)
```

### ✅ EXEMPLOS CORRETOS
```tsx
// ✅ Sempre faça isso:
<p>{formatDateBR(saleDetails.sale_date)}</p>        // 15/01/2024
<p>{formatDateBR(saleDetails.created_at)}</p>       // 15/01/2024
<p>{formatDateBR(saleDetails.updated_at)}</p>       // 15/01/2024
```

### 🎨 Tratamento de Datas Nulas
```tsx
// ✅ Para datas opcionais
<p>{saleDetails.next_contact_date ? formatDateBR(saleDetails.next_contact_date) : 'Não agendado'}</p>

// ✅ Para datas obrigatórias
<p>{formatDateBR(saleDetails.sale_date)}</p>
```

## 💰 SEÇÃO ESPECIAL - MÁSCARAS DE VALORES

### ⚠️ REGRA ABSOLUTA
**TODOS os inputs que exibem VALORES ou PORCENTAGENS DEVEM ter máscara aplicada**

### 🎯 Funções Padrão
```tsx
// ✅ Use sempre estas funções para máscaras
import { applyCurrencyMask, removeCurrencyMask } from "../lib/formatting";

// Para valores monetários
const formatCurrency = (value: number): string => {
  return applyCurrencyMask(value.toString());
};

const parseCurrency = (maskedValue: string): number => {
  return parseFloat(removeCurrencyMask(maskedValue)) || 0;
};

// Para porcentagens
const formatPercentage = (value: number): string => {
  return `${value}%`;
};

const parsePercentage = (maskedValue: string): number => {
  return parseFloat(maskedValue.replace('%', '')) || 0;
};
```

### 💵 Exemplos de Uso - Valores Monetários
```tsx
// ✅ Formatação correta para valores
<Input
  label="Valor da Venda"
  value={salePrice ? applyCurrencyMask(salePrice.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setSalePrice(parseFloat(numericValue) || 0);
  }}
/>

// ✅ Formatação correta para saldos (Conciliações)
<Input
  label="Saldo do Extrato"
  type="text"
  value={statementBalance ? applyCurrencyMask(statementBalance.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setStatementBalance(maskedValue);
  }}
  onBlur={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setStatementBalance(numericValue);
  }}
  placeholder="0,00"
  required
/>

<Input
  label="Saldo Contábil"
  type="text"
  value={bookBalance ? applyCurrencyMask(bookBalance.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setBookBalance(maskedValue);
  }}
  onBlur={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setBookBalance(numericValue);
  }}
  placeholder="0,00"
  required
/>

<Input
  label="Preço do Veículo"
  value={vehiclePrice ? applyCurrencyMask(vehiclePrice.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setVehiclePrice(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Entrada"
  value={downPayment ? applyCurrencyMask(downPayment.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setDownPayment(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Comissão"
  value={commission ? applyCurrencyMask(commission.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setCommission(parseFloat(numericValue) || 0);
  }}
/>
```

### 📊 Exemplos de Uso - Porcentagens
```tsx
// ✅ Formatação correta para porcentagens
<Input
  label="Margem (%)"
  value={margin ? `${margin}%` : '0%'}
  onChange={(e) => {
    const numericValue = e.target.value.replace('%', '');
    setMargin(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Desconto (%)"
  value={discount ? `${discount}%` : '0%'}
  onChange={(e) => {
    const numericValue = e.target.value.replace('%', '');
    setDiscount(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Taxa de Juros (%)"
  value={interestRate ? `${interestRate}%` : '0%'}
  onChange={(e) => {
    const numericValue = e.target.value.replace('%', '');
    setInterestRate(parseFloat(numericValue) || 0);
  }}
/>
```

### ❌ EXEMPLOS PROIBIDOS
```tsx
// ❌ NUNCA faça isso:
<Input label="Valor" value={valor} onChange={setValor} />                    // Sem máscara
<Input label="Preço" value={preco} onChange={setPreco} />                   // Sem máscara
<Input label="Comissão" value={comissao} onChange={setComissao} />          // Sem máscara
<Input label="Margem" value={margem} onChange={setMargem} />                // Sem máscara
<Input label="Desconto" value={desconto} onChange={setDesconto} />          // Sem máscara
```

### ✅ EXEMPLOS CORRETOS
```tsx
// ✅ Sempre faça isso:
<Input
  label="Valor"
  value={valor ? applyCurrencyMask(valor.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setValor(parseFloat(numericValue) || 0);
  }}
/>

<Input
  label="Margem (%)"
  value={margem ? `${margem}%` : '0%'}
  onChange={(e) => {
    const numericValue = e.target.value.replace('%', '');
    setMargem(parseFloat(numericValue) || 0);
  }}
/>
```

### 🎨 Tratamento de Valores Nulos
```tsx
// ✅ Para valores opcionais
<Input
  label="Valor Opcional"
  value={optionalValue ? applyCurrencyMask(optionalValue.toString()) : ''}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setOptionalValue(numericValue ? parseFloat(numericValue) : null);
  }}
/>

// ✅ Para valores obrigatórios
<Input
  label="Valor Obrigatório"
  value={requiredValue ? applyCurrencyMask(requiredValue.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setRequiredValue(parseFloat(numericValue) || 0);
  }}
/>
```

### 🏦 SEÇÃO ESPECIAL - INPUTS DE CONCILIAÇÃO

#### ⚠️ REGRA CRÍTICA PARA SALDOS
**TODOS os inputs de saldo (Saldo do Extrato, Saldo Contábil, etc.) DEVEM usar `type="text"` com máscara de moeda**

#### 🎯 Padrão Obrigatório para Saldos
```tsx
// ✅ SEMPRE use este padrão para inputs de saldo
<Input
  label="Saldo do Extrato"
  type="text"  // ⚠️ OBRIGATÓRIO: type="text", nunca "number"
  value={statementBalance ? applyCurrencyMask(statementBalance.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setStatementBalance(maskedValue);
  }}
  onBlur={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setStatementBalance(numericValue);
  }}
  placeholder="0,00"
  required
/>

<Input
  label="Saldo Contábil"
  type="text"  // ⚠️ OBRIGATÓRIO: type="text", nunca "number"
  value={bookBalance ? applyCurrencyMask(bookBalance.toString()) : 'R$ 0,00'}
  onChange={(e) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setBookBalance(maskedValue);
  }}
  onBlur={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setBookBalance(numericValue);
  }}
  placeholder="0,00"
  required
/>
```

#### ❌ NUNCA FAÇA ISSO COM SALDOS
```tsx
// ❌ PROIBIDO: type="number" para saldos
<Input label="Saldo do Extrato" type="number" value={saldo} />
<Input label="Saldo Contábil" type="number" value={saldo} />

// ❌ PROIBIDO: Sem máscara para saldos
<Input label="Saldo do Extrato" value={saldo} onChange={setSaldo} />
<Input label="Saldo Contábil" value={saldo} onChange={setSaldo} />
```

#### ✅ EXEMPLOS CORRETOS PARA CONCILIAÇÃO
```tsx
// ✅ Formulário de conciliação completo
const [formData, setFormData] = useState({
  account_id: "",
  reconciliation_date: "",
  statement_balance: "",
  book_balance: "",
  notes: ""
});

<Input
  label="Saldo do Extrato"
  type="text"
  name="statement_balance"
  value={formData.statement_balance}
  onChange={(e) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setFormData({...formData, statement_balance: maskedValue});
  }}
  onBlur={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setFormData({...formData, statement_balance: numericValue});
  }}
  placeholder="0,00"
  required
/>

<Input
  label="Saldo Contábil"
  type="text"
  name="book_balance"
  value={formData.book_balance}
  onChange={(e) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setFormData({...formData, book_balance: maskedValue});
  }}
  onBlur={(e) => {
    const numericValue = removeCurrencyMask(e.target.value);
    setFormData({...formData, book_balance: numericValue});
  }}
  placeholder="0,00"
  required
/>
```

## 📋 SEÇÃO ESPECIAL - MÁSCARAS DE DOCUMENTOS

### ⚠️ REGRA ABSOLUTA
**TODOS os inputs que exibem CPF, CEP ou CNPJ DEVEM ter máscara aplicada**

### 🎯 Funções Padrão
```tsx
// ✅ Use sempre estas funções para máscaras de documentos
import { 
  applyCpfMask, removeCpfMask, 
  applyCepMask, removeCepMask, 
  applyCnpjMask, removeCnpjMask 
} from "../lib/formatting";

// Para CPF
const formatCpf = (value: string): string => {
  return applyCpfMask(value);
};

const parseCpf = (maskedValue: string): string => {
  return removeCpfMask(maskedValue);
};

// Para CEP
const formatCep = (value: string): string => {
  return applyCepMask(value);
};

const parseCep = (maskedValue: string): string => {
  return removeCepMask(maskedValue);
};

// Para CNPJ
const formatCnpj = (value: string): string => {
  return applyCnpjMask(value);
};

const parseCnpj = (maskedValue: string): string => {
  return removeCnpjMask(maskedValue);
};
```

### 🆔 Exemplos de Uso - CPF
```tsx
// ✅ Formatação correta para CPF
<Input
  label="CPF"
  value={cpf ? applyCpfMask(cpf) : ''}
  onChange={(e) => {
    const cleanValue = removeCpfMask(e.target.value);
    setCpf(cleanValue);
  }}
  placeholder="000.000.000-00"
  maxLength={14}
/>

<Input
  label="CPF do Cliente"
  value={customerCpf ? applyCpfMask(customerCpf) : ''}
  onChange={(e) => {
    const cleanValue = removeCpfMask(e.target.value);
    setCustomerCpf(cleanValue);
  }}
  placeholder="000.000.000-00"
  maxLength={14}
/>
```

### 📮 Exemplos de Uso - CEP
```tsx
// ✅ Formatação correta para CEP
<Input
  label="CEP"
  value={cep ? applyCepMask(cep) : ''}
  onChange={(e) => {
    const cleanValue = removeCepMask(e.target.value);
    setCep(cleanValue);
  }}
  placeholder="00000-000"
  maxLength={9}
/>

<Input
  label="CEP de Entrega"
  value={deliveryCep ? applyCepMask(deliveryCep) : ''}
  onChange={(e) => {
    const cleanValue = removeCepMask(e.target.value);
    setDeliveryCep(cleanValue);
  }}
  placeholder="00000-000"
  maxLength={9}
/>
```

### 🏢 Exemplos de Uso - CNPJ
```tsx
// ✅ Formatação correta para CNPJ
<Input
  label="CNPJ"
  value={cnpj ? applyCnpjMask(cnpj) : ''}
  onChange={(e) => {
    const cleanValue = removeCnpjMask(e.target.value);
    setCnpj(cleanValue);
  }}
  placeholder="00.000.000/0000-00"
  maxLength={18}
/>

<Input
  label="CNPJ da Empresa"
  value={companyCnpj ? applyCnpjMask(companyCnpj) : ''}
  onChange={(e) => {
    const cleanValue = removeCnpjMask(e.target.value);
    setCompanyCnpj(cleanValue);
  }}
  placeholder="00.000.000/0000-00"
  maxLength={18}
/>
```

### ❌ EXEMPLOS PROIBIDOS
```tsx
// ❌ NUNCA faça isso:
<Input label="CPF" value={cpf} onChange={setCpf} />                    // Sem máscara
<Input label="CEP" value={cep} onChange={setCep} />                    // Sem máscara
<Input label="CNPJ" value={cnpj} onChange={setCnpj} />                 // Sem máscara
<Input label="CPF do Cliente" value={customerCpf} onChange={setCustomerCpf} />  // Sem máscara
```

### ✅ EXEMPLOS CORRETOS
```tsx
// ✅ Sempre faça isso:
<Input
  label="CPF"
  value={cpf ? applyCpfMask(cpf) : ''}
  onChange={(e) => {
    const cleanValue = removeCpfMask(e.target.value);
    setCpf(cleanValue);
  }}
  placeholder="000.000.000-00"
  maxLength={14}
/>

<Input
  label="CEP"
  value={cep ? applyCepMask(cep) : ''}
  onChange={(e) => {
    const cleanValue = removeCepMask(e.target.value);
    setCep(cleanValue);
  }}
  placeholder="00000-000"
  maxLength={9}
/>

<Input
  label="CNPJ"
  value={cnpj ? applyCnpjMask(cnpj) : ''}
  onChange={(e) => {
    const cleanValue = removeCnpjMask(e.target.value);
    setCnpj(cleanValue);
  }}
  placeholder="00.000.000/0000-00"
  maxLength={18}
/>
```

### 🎨 Tratamento de Documentos Nulos
```tsx
// ✅ Para documentos opcionais
<Input
  label="CPF (Opcional)"
  value={optionalCpf ? applyCpfMask(optionalCpf) : ''}
  onChange={(e) => {
    const cleanValue = removeCpfMask(e.target.value);
    setOptionalCpf(cleanValue || null);
  }}
  placeholder="000.000.000-00"
  maxLength={14}
/>

// ✅ Para documentos obrigatórios
<Input
  label="CPF (Obrigatório)"
  value={requiredCpf ? applyCpfMask(requiredCpf) : ''}
  onChange={(e) => {
    const cleanValue = removeCpfMask(e.target.value);
    setRequiredCpf(cleanValue);
  }}
  placeholder="000.000.000-00"
  maxLength={14}
  required
/>
```

### 📏 Limites de Caracteres
```tsx
// ✅ Sempre defina maxLength para documentos
<Input maxLength={14} />  // CPF: 000.000.000-00
<Input maxLength={9} />   // CEP: 00000-000
<Input maxLength={18} />  // CNPJ: 00.000.000/0000-00
```

## 🎯 SEÇÃO ESPECIAL - POSICIONAMENTO DE BOTÕES

### ⚠️ REGRA ABSOLUTA
**Em páginas de edição, os botões de ação (Salvar/Cancelar) DEVEM ficar no HEADER, não no final da página**

### 🎯 Padrão de Layout
```tsx
// ✅ Estrutura correta para páginas de edição
<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
  <div className="px-4 py-6 sm:px-0">
    {/* Header com botões de ação */}
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => router.back()}>
            Voltar
          </Button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 mt-4">
            Editar Item
          </h2>
          <p className="text-gray-600">
            Descrição do item
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>

    {/* Conteúdo da página */}
    <div className="bg-white rounded-lg shadow p-6">
      {/* Formulário aqui */}
    </div>
  </div>
</main>
```

### ❌ EXEMPLOS PROIBIDOS
```tsx
// ❌ NUNCA faça isso - botões no final da página
<main>
  <div className="mb-8">
    <h2>Editar Item</h2>
  </div>
  
  <div className="bg-white rounded-lg shadow p-6">
    {/* Formulário */}
  </div>
  
  {/* ❌ Botões no final - PROIBIDO! */}
  <div className="mt-8">
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
      <Button variant="primary" onClick={handleSave}>Salvar</Button>
    </div>
  </div>
</main>
```

### ✅ EXEMPLOS CORRETOS
```tsx
// ✅ Sempre faça isso - botões no header
<main>
  <div className="mb-8">
    <div className="flex justify-between items-center">
      <div>
        <h2>Editar Item</h2>
        <p>Descrição</p>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Salvar</Button>
      </div>
    </div>
  </div>
  
  <div className="bg-white rounded-lg shadow p-6">
    {/* Formulário */}
  </div>
</main>
```

### 🎨 Variações Aceitas
```tsx
// ✅ Botões no header com ícones
<div className="flex space-x-3">
  <Button 
    variant="outline" 
    onClick={handleCancel}
    leftIcon={<CancelIcon />}
  >
    Cancelar
  </Button>
  <Button 
    variant="primary" 
    onClick={handleSave}
    leftIcon={<SaveIcon />}
    disabled={isSaving}
  >
    {isSaving ? 'Salvando...' : 'Salvar'}
  </Button>
</div>

// ✅ Botões no header com loading
<Button 
  variant="primary" 
  onClick={handleSave}
  disabled={isSaving}
  leftIcon={
    isSaving ? (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    ) : (
      <SaveIcon />
    )
  }
>
  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
</Button>
```

### 🎯 Benefícios do Posicionamento no Header
- ✅ **Acesso imediato** aos botões de ação
- ✅ **Não precisa rolar** até o final da página
- ✅ **UX consistente** com padrões modernos
- ✅ **Visibilidade** dos botões importantes
- ✅ **Eficiência** na navegação

---

## 🔄 COMPONENTE SWITCH

### 📋 Regras Obrigatórias

1. **SEMPRE** use o componente `<Switch>` para toggles/checkboxes visuais
2. **NUNCA** use `<input type="checkbox">` nativo para toggles visuais
3. **SEMPRE** use `forwardRef` para referências
4. **SEMPRE** estenda `React.InputHTMLAttributes<HTMLInputElement>`
5. **SEMPRE** use `displayName` para debugging

### 🎯 Props do Switch

```tsx
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;           // Label opcional acima do switch
  error?: string;           // Mensagem de erro
  helperText?: string;      // Texto de ajuda
  size?: 'sm' | 'md' | 'lg'; // Tamanhos disponíveis
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'; // Variantes de cor
}
```

### 📏 Tamanhos Disponíveis

- **sm**: `w-9 h-5` - Switch pequeno
- **md**: `w-11 h-6` - Switch médio (padrão)
- **lg**: `w-14 h-7` - Switch grande

### 🎨 Variantes de Cor

- **primary**: Azul primário (padrão)
- **secondary**: Cinza
- **success**: Verde
- **warning**: Amarelo
- **danger**: Vermelho

### ✅ Exemplos de Uso

#### **Switch Básico**
```tsx
<Switch
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
/>
```

#### **Switch com Label**
```tsx
<Switch
  label="Ativar notificações"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>
```

#### **Switch com Tamanho e Variante**
```tsx
<Switch
  label="Modo escuro"
  size="lg"
  variant="secondary"
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
/>
```

#### **Switch com Erro**
```tsx
<Switch
  label="Aceitar termos"
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
  error="Você deve aceitar os termos para continuar"
/>
```

#### **Switch Desabilitado**
```tsx
<Switch
  label="Configuração avançada"
  checked={advanced}
  onChange={(e) => setAdvanced(e.target.checked)}
  disabled
/>
```

### 🎯 Estrutura Interna

```tsx
// ✅ Estrutura correta do Switch
<label className="relative inline-flex items-center cursor-pointer">
  <input
    ref={ref}
    type="checkbox"
    className="sr-only peer"
    {...props}
  />
  <div className={`
    ${sizeClasses.container}
    bg-gray-200 
    peer-focus:outline-none 
    peer-focus:ring-4 
    ${variantClasses}
    rounded-full 
    peer 
    peer-checked:after:translate-x-full 
    peer-checked:after:border-white 
    after:content-[''] 
    after:absolute 
    ${sizeClasses.thumb}
    after:bg-white 
    after:border-gray-300 
    after:border 
    after:rounded-full 
    after:transition-all
  `}></div>
</label>
```

### 🚫 O Que NÃO Fazer

```tsx
// ❌ NUNCA use input nativo para toggle visual
<input type="checkbox" className="toggle" />

// ❌ NUNCA use classes customizadas para toggle
<div className="custom-toggle" />

// ❌ NUNCA esqueça o forwardRef
const Switch = ({ ...props }) => { ... }
```

### ✅ O Que Fazer

```tsx
// ✅ SEMPRE use o componente Switch
<Switch checked={value} onChange={handleChange} />

// ✅ SEMPRE use forwardRef
const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ ...props }, ref) => { ... })

// ✅ SEMPRE use displayName
Switch.displayName = "Switch";
```

### 🎯 Checklist do Switch

- [ ] Usa `forwardRef<HTMLInputElement, SwitchProps>`
- [ ] Estende `React.InputHTMLAttributes<HTMLInputElement>`
- [ ] Tem `displayName = "Switch"`
- [ ] Suporta `label`, `error`, `helperText`
- [ ] Suporta `size` ('sm', 'md', 'lg')
- [ ] Suporta `variant` ('primary', 'secondary', 'success', 'warning', 'danger')
- [ ] Input é `sr-only peer`
- [ ] Div visual usa classes Tailwind corretas
- [ ] Transições suaves com `after:transition-all`
- [ ] Estados de focus e checked funcionam
- [ ] Acessibilidade mantida

### 🎨 Estilos do Switch

- **Container**: `bg-gray-200 rounded-full`
- **Thumb**: `bg-white border-gray-300 border rounded-full`
- **Checked**: `peer-checked:bg-{variant} peer-checked:after:translate-x-full`
- **Focus**: `peer-focus:ring-4 peer-focus:ring-{variant}`
- **Transição**: `after:transition-all`

---

**LEMBRE-SE**: Consistência é fundamental. Use sempre os componentes existentes!
