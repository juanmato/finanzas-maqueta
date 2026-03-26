import type { Transaction } from '../types';
import { formatCurrency, getTotalByType } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: Props) {
  const income = getTotalByType(transactions, 'income');
  const expense = getTotalByType(transactions, 'expense');
  const balance = income - expense;

  const cards = [
    {
      label: 'Balance',
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? 'text-indigo-600' : 'text-red-500',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
    {
      label: 'Ingresos',
      value: income,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Gastos',
      value: expense,
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
              <c.icon size={20} className={c.iconColor} />
            </div>
            <span className="text-sm text-gray-500">{c.label}</span>
          </div>
          <p className={`text-2xl font-bold ${c.color}`}>{formatCurrency(c.value)}</p>
        </div>
      ))}
    </div>
  );
}
