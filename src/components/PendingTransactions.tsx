import { useState } from 'react';
import type { Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS, SOURCES } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { Check, X, Edit3, CheckCheck, XCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onApprove: (id: string, updates: Partial<Transaction>) => void;
  onApproveAll: () => void;
  onReject: (id: string) => void;
  onRejectAll: () => void;
}

export default function PendingTransactions({ transactions, onApprove, onApproveAll, onReject, onRejectAll }: Props) {
  const pending = transactions.filter((t) => t.status === 'pending');
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
    setEditSource(t.source || '');
  }

  function saveEdit(id: string) {
    onApprove(id, { category: editCategory, type: editType, description: editDescription, source: editSource });
    setEditingId(null);
  }

  if (pending.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center animate-fade-in">
        <CheckCheck size={48} className="mx-auto text-emerald-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Todo al dia</h3>
        <p className="text-sm text-gray-400">No hay transacciones pendientes de aprobacion</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Pendientes de aprobacion
          </h2>
          <p className="text-sm text-gray-400">{pending.length} transacciones por revisar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.confirm(`Aprobar las ${pending.length} transacciones pendientes?`)) onApproveAll();
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:outline-offset-2"
          >
            <CheckCheck size={16} />
            Aprobar todas ({pending.length})
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Rechazar las ${pending.length} transacciones pendientes? Esta accion no se puede deshacer.`)) onRejectAll();
            }}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
          >
            <XCircle size={16} />
            Rechazar todas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {pending.map((t) => (
          <div key={t.id} className="p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: (CATEGORY_COLORS[t.category] || '#6b7280') + '1a' }}
              >
                {t.type === 'income' ? (
                  <ArrowUpCircle size={20} className="text-emerald-500" />
                ) : (
                  <ArrowDownCircle size={20} className="text-red-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                  <span className={`text-sm font-semibold font-[IBM_Plex_Mono] tabular-nums px-2 py-0.5 rounded shrink-0 ${
                    t.type === 'income'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>

                {t.originalDescription && t.originalDescription !== t.description && (
                  <p className="text-xs text-gray-400 truncate mb-1">Original: {t.originalDescription}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>{new Date(t.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>&middot;</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                    {t.category}
                  </span>
                  <span>&middot;</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                  </span>
                  {t.source && (
                    <>
                      <span>&middot;</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                        {t.source}
                      </span>
                    </>
                  )}
                </div>

                {editingId === t.id && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Nombre / descripcion"
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as 'income' | 'expense')}
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
                        <optgroup label="Gastos">
                          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                        <optgroup label="Ingresos">
                          {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
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
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
                      >
                        Guardar y aprobar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {editingId !== t.id && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(t)}
                    title="Editar"
                    aria-label={`Editar ${t.description}`}
                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onApprove(t.id, {})}
                    title="Aprobar"
                    aria-label={`Aprobar ${t.description}`}
                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Rechazar esta transaccion?')) onReject(t.id);
                    }}
                    title="Rechazar"
                    aria-label={`Rechazar ${t.description}`}
                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
