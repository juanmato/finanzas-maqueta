import type { Transaction } from '../types';
import { formatCurrency, getTotalByTypeAndCurrency, getUsedCurrencies } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: Props) {
  const currencies = getUsedCurrencies(transactions);
  // If no transactions yet, show UYU by default
  const displayCurrencies = currencies.length > 0 ? currencies : ['UYU' as const];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Balance card */}
      <div className="sm:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-sm text-indigo-200">Balance</span>
        </div>
        <div className="space-y-1">
          {displayCurrencies.map((cur) => {
            const income = getTotalByTypeAndCurrency(transactions, 'income', cur);
            const expense = getTotalByTypeAndCurrency(transactions, 'expense', cur);
            const balance = income - expense;
            return (
              <p key={cur} className="text-2xl font-bold font-[IBM_Plex_Mono] tabular-nums">
                {formatCurrency(balance, cur)}
              </p>
            );
          })}
        </div>
      </div>

      {/* Income card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slide-up stagger-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <span className="text-sm text-gray-500">Ingresos</span>
        </div>
        <div className="space-y-0.5">
          {displayCurrencies.map((cur) => (
            <p key={cur} className="text-xl font-bold text-emerald-600 font-[IBM_Plex_Mono] tabular-nums">
              {formatCurrency(getTotalByTypeAndCurrency(transactions, 'income', cur), cur)}
            </p>
          ))}
        </div>
      </div>

      {/* Expense card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slide-up stagger-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingDown size={20} className="text-red-500" />
          </div>
          <span className="text-sm text-gray-500">Gastos</span>
        </div>
        <div className="space-y-0.5">
          {displayCurrencies.map((cur) => (
            <p key={cur} className="text-xl font-bold text-red-500 font-[IBM_Plex_Mono] tabular-nums">
              {formatCurrency(getTotalByTypeAndCurrency(transactions, 'expense', cur), cur)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
