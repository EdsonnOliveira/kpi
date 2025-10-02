// Funções utilitárias para formatação de valores

/**
 * Formata um valor numérico como moeda brasileira (Real)
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada como moeda
 */
export function formatCurrency(
  value: number | string, 
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return showSymbol ? 'R$ 0,00' : '0,00';

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numValue);

  return showSymbol ? formatted : formatted.replace('R$', '').trim();
}

/**
 * Formata um valor numérico como número brasileiro
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada como número
 */
export function formatNumber(
  value: number | string,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useGrouping?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true
  } = options;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(numValue);
}

/**
 * Formata um valor como percentual
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada como percentual
 */
export function formatPercent(
  value: number | string,
  options: {
    showSign?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSign = false,
    minimumFractionDigits = 1,
    maximumFractionDigits = 1
  } = options;

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0,0%';

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numValue / 100);

  return showSign && numValue > 0 ? `+${formatted}` : formatted;
}

/**
 * Formata quilometragem
 * @param value - Valor numérico da quilometragem
 * @returns String formatada com "Km"
 */
export function formatMileage(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === 0) return '0 Km';
  
  return `${formatNumber(numValue, { useGrouping: true })} Km`;
}

/**
 * Formata um valor de entrada para moeda (remove caracteres não numéricos)
 * @param value - String de entrada
 * @returns String limpa para conversão numérica
 */
export function parseCurrencyInput(value: string): number {
  // Remove tudo exceto números, vírgulas e pontos
  const cleanValue = value.replace(/[^\d,.-]/g, '');
  
  // Substitui vírgula por ponto para conversão
  const normalizedValue = cleanValue.replace(',', '.');
  
  return parseFloat(normalizedValue) || 0;
}

/**
 * Formata um valor para exibição em input de moeda
 * @param value - Valor numérico
 * @returns String formatada para input
 */
export function formatCurrencyInput(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  return formatCurrency(numValue, { showSymbol: false });
}

/**
 * Formata um valor compacto (ex: 1.5K, 2.3M)
 * @param value - Valor numérico
 * @returns String formatada de forma compacta
 */
export function formatCompact(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';

  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1).replace('.', ',')}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1).replace('.', ',')}K`;
  }
  
  return formatNumber(numValue, { maximumFractionDigits: 0 });
}

/**
 * Formata um valor compacto como moeda
 * @param value - Valor numérico
 * @returns String formatada como moeda compacta
 */
export function formatCompactCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0';

  if (numValue >= 1000000) {
    return `R$ ${(numValue / 1000000).toFixed(1).replace('.', ',')}M`;
  } else if (numValue >= 1000) {
    return `R$ ${(numValue / 1000).toFixed(1).replace('.', ',')}K`;
  }
  
  return formatCurrency(numValue);
}

/**
 * Valida se um valor é um número válido
 * @param value - Valor a ser validado
 * @returns Boolean indicando se é válido
 */
export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}

/**
 * Converte string de moeda para número
 * @param currencyString - String no formato "R$ 1.234,56"
 * @returns Número convertido
 */
export function parseCurrencyString(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove símbolo da moeda e espaços
  const cleanString = currencyString.replace(/[R$\s]/g, '');
  
  // Se tem vírgula, assume formato brasileiro (1.234,56)
  if (cleanString.includes(',')) {
    // Remove pontos de milhares e substitui vírgula por ponto
    return parseFloat(cleanString.replace(/\./g, '').replace(',', '.'));
  }
  
  // Se não tem vírgula, assume formato americano (1234.56)
  return parseFloat(cleanString);
}

/**
 * Aplica máscara de moeda em tempo real durante a digitação
 * @param value - Valor digitado pelo usuário
 * @returns String formatada com máscara
 */
export function applyCurrencyMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para obter centavos
  const amount = parseInt(numbers) / 100;
  
  // Formata como moeda brasileira sem símbolo
  return formatCurrency(amount, { showSymbol: false });
}

/**
 * Remove máscara de moeda e retorna apenas números
 * @param maskedValue - Valor com máscara (ex: "1.234,56")
 * @returns String apenas com números (ex: "1234.56")
 */
export function removeCurrencyMask(maskedValue: string): string {
  if (!maskedValue) return '';
  
  // Remove pontos de milhares e substitui vírgula por ponto
  return maskedValue.replace(/\./g, '').replace(',', '.');
}

/**
 * Valida se o valor digitado é válido para moeda
 * @param value - Valor a ser validado
 * @returns Boolean indicando se é válido
 */
export function isValidCurrencyInput(value: string): boolean {
  if (!value) return true; // Campo vazio é válido
  
  // Remove máscara e verifica se é um número válido
  const numericValue = removeCurrencyMask(value);
  return !isNaN(parseFloat(numericValue)) && isFinite(parseFloat(numericValue));
}

/**
 * Aplica máscara de CPF (XXX.XXX.XXX-XX)
 * @param value - Valor digitado pelo usuário
 * @returns String formatada com máscara de CPF
 */
export function applyCpfMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara
  return limitedNumbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Remove máscara de CPF e retorna apenas números
 * @param maskedValue - Valor com máscara (ex: "123.456.789-01")
 * @returns String apenas com números (ex: "12345678901")
 */
export function removeCpfMask(maskedValue: string): string {
  if (!maskedValue) return '';
  return maskedValue.replace(/\D/g, '');
}

/**
 * Aplica máscara de telefone ((XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
 * @param value - Valor digitado pelo usuário
 * @returns String formatada com máscara de telefone
 */
export function applyPhoneMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara baseada no tamanho
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
}

/**
 * Remove máscara de telefone e retorna apenas números
 * @param maskedValue - Valor com máscara (ex: "(11) 99999-9999")
 * @returns String apenas com números (ex: "11999999999")
 */
export function removePhoneMask(maskedValue: string): string {
  if (!maskedValue) return '';
  return maskedValue.replace(/\D/g, '');
}

/**
 * Aplica máscara de CEP (XXXXX-XXX)
 * @param value - Valor digitado pelo usuário
 * @returns String formatada com máscara de CEP
 */
export function applyCepMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const limitedNumbers = numbers.slice(0, 8);
  
  // Aplica a máscara
  return limitedNumbers.replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Remove máscara de CEP e retorna apenas números
 * @param maskedValue - Valor com máscara (ex: "12345-678")
 * @returns String apenas com números (ex: "12345678")
 */
export function removeCepMask(maskedValue: string): string {
  if (!maskedValue) return '';
  return maskedValue.replace(/\D/g, '');
}

/**
 * Aplica máscara de data (DD/MM/AAAA)
 * @param value - Valor digitado pelo usuário
 * @returns String formatada com máscara de data
 */
export function applyDateMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const limitedNumbers = numbers.slice(0, 8);
  
  // Aplica a máscara
  return limitedNumbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

/**
 * Remove máscara de data e retorna apenas números
 * @param maskedValue - Valor com máscara (ex: "30/09/2025")
 * @returns String apenas com números (ex: "30092025")
 */
export function removeDateMask(maskedValue: string): string {
  if (!maskedValue) return '';
  return maskedValue.replace(/\D/g, '');
}

/**
 * Valida se o CPF é válido
 * @param cpf - CPF com ou sem máscara
 * @returns Boolean indicando se é válido
 */
export function isValidCpf(cpf: string): boolean {
  const cleanCpf = removeCpfMask(cpf);
  
  if (cleanCpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
  
  return true;
}

/**
 * Valida se o telefone é válido
 * @param phone - Telefone com ou sem máscara
 * @returns Boolean indicando se é válido
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = removePhoneMask(phone);
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Valida se o CEP é válido
 * @param cep - CEP com ou sem máscara
 * @returns Boolean indicando se é válido
 */
export function isValidCep(cep: string): boolean {
  const cleanCep = removeCepMask(cep);
  return cleanCep.length === 8;
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA)
 * @param dateString - String de data (ISO, timestamp, etc.)
 * @returns String formatada no padrão brasileiro
 */
export function formatDateBR(dateString: string | Date): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}
