export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'approved' | 'pending';

export type Currency = 'UYU' | 'USD';

export type PaymentMethod = 'efectivo' | 'debito' | 'credito' | 'cuenta_bancaria' | 'transferencia';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  source: string; // bank name or 'Efectivo'
  paymentMethod: PaymentMethod;
  originalDescription?: string; // raw text from bank
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM
}

export interface CategorySummary {
  category: string;
  total: number;
  color: string;
}

export type ViewTab = 'dashboard' | 'transactions' | 'budgets' | 'import' | 'pending';
