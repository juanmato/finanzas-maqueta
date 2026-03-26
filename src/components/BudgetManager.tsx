import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Budget, Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { Target, Trash2, Plus } from 'lucide-react';

interface Props {
  budgets: Budget[];
  onSetBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  transactions: Transaction[];
  selectedMonth: string;
}

export default function BudgetManager({ budgets, onSetBudgets, transactions, selectedMonth }: Props) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);
  const expenses = transactions.filter((t) => t.type === 'expense');

  function getSpent(cat: string): number {
    return expenses.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !limit) return;

    const existing = budgets.findIndex((b) => b.category === category && b.month === selectedMonth);
    if (existing >= 0) {
      const updated = [...budgets];
      updated[existing] = { ...updated[existing], limit: parseFloat(limit) };
      onSetBudgets(updated);
    } else {
      onSetBudgets([...budgets, { id: uuidv4(), category, limit: parseFloat(limit), month: selectedMonth }]);
    }
    setCategory('');
    setLimit('');
  }

  function handleDelete(id: string) {
    onSetBudgets(budgets.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Target size={20} className="text-indigo-500" />
          Definir presupuesto
        </h2>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        >
          <option value="">Categoria</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Limite mensual"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Guardar presupuesto
        </button>
      </form>

      {monthBudgets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          No hay presupuestos definidos para este mes
        </div>
      ) : (
        <div className="space-y-3">
          {monthBudgets.map((b) => {
            const spent = getSpent(b.category);
            const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
            const over = spent > b.limit;
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">{b.category}</span>
                  <button onClick={() => handleDelete(b.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>{formatCurrency(spent)} de {formatCurrency(b.limit)}</span>
                  <span className={over ? 'text-red-500 font-semibold' : ''}>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${over ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {over && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">
                    Excedido por {formatCurrency(spent - b.limit)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
