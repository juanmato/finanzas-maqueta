import { useState } from 'react';
import type { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, SOURCES } from '../utils/constants';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Edit3, Check, X } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export default function TransactionList({ transactions, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editDescription, setEditDescription] = useState('');
  const [editSource, setEditSource] = useState('');

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setEditCategory(t.category);
    setEditType(t.type);
    setEditDescription(t.description);
    setEditSource(t.source || 'Efectivo');
  }

  function saveEdit(id: string) {
    onUpdate(id, {
      category: editCategory,
      type: editType,
      description: editDescription,
      source: editSource,
    });
    setEditingId(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 animate-fade-in">
        No hay transacciones este mes
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const categories = editType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 animate-slide-up">
      {sorted.map((t) => (
        <div key={t.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center gap-3">
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
                {t.category}
                {t.source ? <> &middot; <span className="text-indigo-500">{t.source}</span></> : null}
                {' '}&middot; {new Date(t.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className={`text-sm font-semibold font-[IBM_Plex_Mono] tabular-nums px-2 py-0.5 rounded shrink-0 ${
              t.type === 'income'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-red-600 bg-red-50'
            }`}>
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
            </span>
            <button
              onClick={() => startEdit(t)}
              aria-label={`Editar ${t.description || t.category}`}
              className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-indigo-500 transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Eliminar esta transaccion?')) onDelete(t.id);
              }}
              aria-label={`Eliminar transaccion ${t.description || t.category}`}
              className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors rounded-lg focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-[-2px]"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {editingId === t.id && (
            <div className="mt-3 ml-13 space-y-2">
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripcion"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={editType}
                  onChange={(e) => { setEditType(e.target.value as 'income' | 'expense'); setEditCategory(''); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => saveEdit(t.id)}
                  className="p-1.5 text-emerald-500 hover:text-emerald-600 transition-colors"
                  aria-label="Guardar cambios"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cancelar edicion"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
