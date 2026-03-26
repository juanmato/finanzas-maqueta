export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'approved' | 'pending';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  source: string; // bank name or 'Efectivo'
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
