/**
 * Máscaras para formatação automática de campos de entrada
 */

// Máscara para data (DD/MM/AAAA)
export const maskDate = (text) => {
  const cleaned = text.replace(/\D/g, '');
  let formatted = '';
  
  if (cleaned.length > 0) {
    formatted = cleaned.substring(0, 2);
    if (cleaned.length >= 2) {
      formatted += '/' + cleaned.substring(2, 4);
      if (cleaned.length >= 4) {
        formatted += '/' + cleaned.substring(4, 8);
      }
    }
  }
  
  return formatted;
};

// Máscara para valor monetário (R$ 0.00)
export const maskCurrency = (text) => {
  const cleaned = text.replace(/\D/g, '');
  const numericValue = parseInt(cleaned) / 100;
  
  if (isNaN(numericValue)) {
    return '';
  }
  
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Converte string formatada para número (ex: "1.234,56" -> 1234.56)
export const currencyToNumber = (formatted) => {
  if (!formatted) return 0;
  const cleaned = formatted.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// Converte número para string formatada (ex: 1234.56 -> "1.234,56")
export const numberToCurrency = (number) => {
  if (isNaN(number)) return '0,00';
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
