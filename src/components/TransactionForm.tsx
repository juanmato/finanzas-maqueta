import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, TransactionType, Currency, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SOURCES, CURRENCIES, PAYMENT_METHODS } from '../utils/constants';
import { PlusCircle } from 'lucide-react';

interface Props {
  onAdd: (t: Transaction) => void;
}

const inputBase = "w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors";
const inputOk = "border-gray-200 focus:ring-indigo-400";
const inputErr = "border-red-400 focus:ring-red-400 bg-red-50/50";

export default function TransactionForm({ onAdd }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('Efectivo');
  const [currency, setCurrency] = useState<Currency>('UYU');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    if (!amount) newErrors.amount = 'El monto es obligatorio';
    else if (isNaN(parsedAmount) || parsedAmount <= 0) newErrors.amount = 'Ingresa un monto mayor a 0';
    if (!category) newErrors.category = 'Selecciona una categoria';
    if (!date) newErrors.date = 'Selecciona una fecha';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    onAdd({
      id: uuidv4(),
      type,
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date,
      source,
      paymentMethod,
      status: 'approved',
    });

    setAmount('');
    setCategory('');
    setDescription('');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 animate-slide-up">
      <h2 className="text-lg font-semibold text-gray-800">Nueva transaccion</h2>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 ${
            type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 ${
            type === 'income'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Ingreso
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Monto"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErrors((p) => { delete p.amount; return { ...p }; }); }}
            className={`${inputBase} ${errors.amount ? inputErr : inputOk}`}
          />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className={`border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${inputOk} w-24`}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setErrors((p) => { delete p.category; return { ...p }; }); }}
          className={`${inputBase} ${errors.category ? inputErr : inputOk}`}
        >
          <option value="">Selecciona categoria</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>

      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className={`${inputBase} ${inputOk}`}
      >
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        className={`${inputBase} ${inputOk}`}
      >
        {PAYMENT_METHODS.map((pm) => (
          <option key={pm.value} value={pm.value}>{pm.label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Descripcion (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputBase} ${inputOk}`}
      />

      <div>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setErrors((p) => { delete p.date; return { ...p }; }); }}
          className={`${inputBase} ${errors.date ? inputErr : inputOk}`}
        />
        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
      >
        <PlusCircle size={18} />
        Agregar
      </button>
    </form>
  );
}
