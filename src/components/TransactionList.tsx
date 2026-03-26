import type { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { CATEGORY_COLORS } from '../utils/constants';
import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        No hay transacciones este mes
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
      {sorted.map((t) => (
        <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: (CATEGORY_COLORS[t.category] || '#6b7280') + '1a' }}
          >
            {t.type === 'income' ? (
              <ArrowUpCircle size={20} className="text-emerald-500" />
            ) : (
              <ArrowDownCircle size={20} className="text-red-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {t.description || t.category}
            </p>
            <p className="text-xs text-gray-400">
              {t.category} &middot; {new Date(t.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
          </span>
          <button
            onClick={() => onDelete(t.id)}
            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
