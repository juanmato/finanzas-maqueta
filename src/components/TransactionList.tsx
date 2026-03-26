import { useState, useMemo } from 'react';
import type { Transaction, TransactionType, Currency, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/helpers';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, SOURCES, CURRENCIES, PAYMENT_METHODS } from '../utils/constants';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Edit3, Check, X, Search } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

const editInputBase = "border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 transition-colors";
const editInputOk = "border-gray-200 focus:ring-indigo-400";
const editInputErr = "border-red-400 focus:ring-red-400 bg-red-50/50";

export default function TransactionList({ transactions, onDelete, onUpdate }: Props) {
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editDescription, setEditDescription] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('UYU');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [editErrors, setEditErrors] = useState<Record<string, boolean>>({});

  // Derive available categories from current transactions for filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return [...cats].sort();
  }, [transactions]);

  // Apply filters
  const filtered = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterPaymentMethod && (t.paymentMethod || '') !== filterPaymentMethod) return false;
      if (q && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q) && !(t.source || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [transactions, searchText, filterType, filterCategory, filterPaymentMethod]);

  const hasActiveFilters = searchText !== '' || filterType !== 'all' || filterCategory !== '' || filterPaymentMethod !== '';

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setEditCategory(t.category);
    setEditType(t.type);
    setEditDescription(t.description);
    setEditSource(t.source || 'Efectivo');
    setEditAmount(String(t.amount));
    setEditDate(t.date);
    setEditCurrency(t.currency || 'UYU');
    setEditPaymentMethod(t.paymentMethod || 'efectivo');
    setEditErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setEditErrors({});
  }

  function saveEdit(id: string) {
    const errors: Record<string, boolean> = {};
    const parsedAmount = parseFloat(editAmount);
    if (!editAmount || isNaN(parsedAmount) || parsedAmount <= 0) errors.amount = true;
    if (!editCategory) errors.category = true;
    if (!editDate) errors.date = true;
    if (Object.keys(errors).length) {
      setEditErrors(errors);
      return;
    }
    onUpdate(id, {
      category: editCategory,
      type: editType,
      description: editDescription,
      source: editSource,
      amount: parsedAmount,
      date: editDate,
      currency: editCurrency,
      paymentMethod: editPaymentMethod,
    });
    setEditingId(null);
    setEditErrors({});
  }

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const editCategories = editType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Filter bar (always shown)
  const filterBar = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-slide-up space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por descripcion, categoria o fuente..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | TransactionType)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">Todos los tipos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Todas las categorias</option>
          {availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Todos los medios</option>
          {PAYMENT_METHODS.map((pm) => <option key={pm.value} value={pm.value}>{pm.label}</option>)}
        </select>
        {hasActiveFilters && (
          <button
            onClick={() => { setSearchText(''); setFilterType('all'); setFilterCategory(''); setFilterPaymentMethod(''); }}
            className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors ml-1"
          >
            Limpiar filtros
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} de {transactions.length}
        </span>
      </div>
    </div>
  );

  if (transactions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 animate-fade-in">
          No hay transacciones este mes
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterBar}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 animate-fade-in">
          No hay transacciones que coincidan con los filtros
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 animate-slide-up">
          {sorted.map((t) => (
            <div key={t.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              {editingId === t.id ? (
                /* ── Editing mode ── */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                    <Edit3 size={14} />
                    Editando transaccion
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Descripcion (opcional)"
                        className={`w-full ${editInputBase} ${editInputOk}`}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editAmount}
                        onChange={(e) => { setEditAmount(e.target.value); setEditErrors((p) => ({ ...p, amount: false })); }}
                        placeholder="Monto"
                        className={`w-full ${editInputBase} ${editErrors.amount ? editInputErr : editInputOk}`}
                      />
                      {editErrors.amount && <p className="text-[10px] text-red-500 mt-0.5">Monto invalido</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={editType}
                      onChange={(e) => { setEditType(e.target.value as TransactionType); setEditCategory(''); }}
                      className={`${editInputBase} ${editInputOk}`}
                    >
                      <option value="expense">Gasto</option>
                      <option value="income">Ingreso</option>
                    </select>
                    <div>
                      <select
                        value={editCategory}
                        onChange={(e) => { setEditCategory(e.target.value); setEditErrors((p) => ({ ...p, category: false })); }}
                        className={`${editInputBase} ${editErrors.category ? editInputErr : editInputOk}`}
                      >
                        <option value="">Selecciona categoria</option>
                        {editCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {editErrors.category && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                    </div>
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value)}
                      className={`${editInputBase} ${editInputOk}`}
                    >
                      {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value as Currency)}
                      className={`${editInputBase} ${editInputOk}`}
                    >
                      {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                      className={`${editInputBase} ${editInputOk}`}
                    >
                      {PAYMENT_METHODS.map((pm) => <option key={pm.value} value={pm.value}>{pm.label}</option>)}
                    </select>
                    <div>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => { setEditDate(e.target.value); setEditErrors((p) => ({ ...p, date: false })); }}
                        className={`${editInputBase} ${editErrors.date ? editInputErr : editInputOk}`}
                      />
                      {editErrors.date && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(t.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      aria-label="Guardar cambios"
                    >
                      <Check size={14} /> Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      aria-label="Cancelar edicion"
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Display mode ── */
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
                      {t.paymentMethod ? <> &middot; {PAYMENT_METHODS.find((pm) => pm.value === t.paymentMethod)?.label || t.paymentMethod}</> : null}
                      {' '}&middot; {new Date(t.date + 'T12:00:00').toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold font-[IBM_Plex_Mono] tabular-nums px-2 py-0.5 rounded shrink-0 ${
                    t.type === 'income'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency || 'UYU')}
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
