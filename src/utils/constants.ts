export const EXPENSE_CATEGORIES = [
  'Alimentacion',
  'Transporte',
  'Vivienda',
  'Entretenimiento',
  'Salud',
  'Educacion',
  'Ropa',
  'Servicios',
  'Suscripciones',
  'Otros',
];

export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Regalos',
  'Otros',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentacion: '#e63946',
  Transporte: '#f4a261',
  Vivienda: '#2a9d8f',
  Entretenimiento: '#264653',
  Salud: '#457b9d',
  Educacion: '#6d28d9',
  Ropa: '#db2777',
  Servicios: '#0891b2',
  Suscripciones: '#ca8a04',
  Otros: '#6b7280',
  Salario: '#059669',
  Freelance: '#7c3aed',
  Inversiones: '#1d4ed8',
  Ventas: '#9333ea',
  Regalos: '#ea580c',
};

export const SOURCES = [
  'Efectivo',
  'BROU',
  'Santander',
  'Itau',
  'Scotiabank',
  'BBVA',
  'HSBC',
  'Banorte',
  'Banamex',
  'Prex',
  'Mercado Pago',
  'Otro',
];

export const CURRENCIES = [
  { code: 'UYU' as const, symbol: '$U', label: 'Pesos uruguayos' },
  { code: 'USD' as const, symbol: 'US$', label: 'Dolares' },
];

export const PAYMENT_METHODS = [
  { value: 'efectivo' as const, label: 'Efectivo' },
  { value: 'debito' as const, label: 'Debito' },
  { value: 'credito' as const, label: 'Credito' },
  { value: 'cuenta_bancaria' as const, label: 'Cuenta bancaria' },
  { value: 'transferencia' as const, label: 'Transferencia' },
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
