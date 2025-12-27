export const formatCurrency = (value: number | string, currency: string = 'USD'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(numValue);
};

export const formatPercentage = (value: number | string, decimals: number = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);
  
  return `${numValue.toFixed(decimals)}%`;
};

export const formatNumber = (value: number | string, decimals: number = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const getValueByPath = (obj: any, path: string): any => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  
  return current;
};

export const setValueByPath = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};

