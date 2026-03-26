import type { Currency, Transaction } from '../types';
import { MONTHS } from './constants';

export function formatCurrency(amount: number, currency: Currency = 'UYU'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return '$U\u00A0' + new Intl.NumberFormat('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
}

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

export function getTotalByType(transactions: Transaction[], type: 'income' | 'expense'): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalByTypeAndCurrency(transactions: Transaction[], type: 'income' | 'expense', currency: Currency): number {
  return transactions
    .filter((t) => t.type === type && (t.currency || 'UYU') === currency)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getUsedCurrencies(transactions: Transaction[]): Currency[] {
  const set = new Set<Currency>();
  transactions.forEach((t) => set.add(t.currency || 'UYU'));
  return [...set].sort();
}

export function getMonthOptions(transactions: Transaction[]): string[] {
  const months = new Set<string>();
  months.add(getCurrentMonth());
  transactions.forEach((t) => {
    months.add(t.date.substring(0, 7));
  });
  return Array.from(months).sort().reverse();
}
