import type { Transaction, Budget, Currency } from '../types';
import { formatCurrency, getUsedCurrencies } from '../utils/helpers';
import { PAYMENT_METHODS } from '../utils/constants';
import { Clock, AlertTriangle, TrendingDown, CreditCard } from 'lucide-react';

interface Props {
  monthTransactions: Transaction[];
  allTransactions: Transaction[];
  budgets: Budget[];
  selectedMonth: string;
  onNavigate: (tab: string) => void;
}

interface BudgetAlert {
  category: string;
  spent: number;
  limit: number;
  pct: number;
}

export default function DashboardInsights({ monthTransactions, allTransactions, budgets, selectedMonth, onNavigate }: Props) {
  const pendingCount = allTransactions.filter((t) => t.status === 'pending').length;
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);
  const expenses = monthTransactions.filter((t) => t.type === 'expense');

  // Budget alerts: categories at >=80% or over budget
  const budgetAlerts: BudgetAlert[] = monthBudgets
    .map((b) => {
      const spent = expenses
        .filter((t) => t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return { category: b.category, spent, limit: b.limit, pct };
    })
    .filter((a) => a.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  // Top expense category per currency
  const currencies = getUsedCurrencies(monthTransactions);
  const topCategories = currencies.map((cur) => {
    const curExpenses = expenses.filter((t) => (t.currency || 'UYU') === cur);
    const grouped: Record<string, number> = {};
    curExpenses.forEach((t) => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    const sorted = Object.entries(grouped).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) return null;
    const [category, total] = sorted[0];
    const totalExpenses = curExpenses.reduce((s, t) => s + t.amount, 0);
    const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
    return { currency: cur, category, total, pct };
  }).filter(Boolean) as { currency: Currency; category: string; total: number; pct: number }[];

  // Payment method breakdown
  const paymentBreakdown = (() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((t) => {
      const pm = t.paymentMethod || 'efectivo';
      grouped[pm] = (grouped[pm] || 0) + 1;
    });
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([method, count]) => ({
        label: PAYMENT_METHODS.find((pm) => pm.value === method)?.label || method,
        count,
      }));
  })();

  const hasContent = pendingCount > 0 || budgetAlerts.length > 0 || topCategories.length > 0;
  if (!hasContent) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
      {/* Pending items */}
      {pendingCount > 0 && (
        <button
          onClick={() => onNavigate('pending')}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left hover:bg-amber-100 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Pendientes</span>
          </div>
          <p className="text-lg font-bold text-amber-800">{pendingCount}</p>
          <p className="text-xs text-amber-600 group-hover:underline">
            {pendingCount === 1 ? 'transaccion por revisar' : 'transacciones por revisar'}
          </p>
        </button>
      )}

      {/* Budget alerts */}
      {budgetAlerts.slice(0, 2).map((alert) => (
        <button
          key={alert.category}
          onClick={() => onNavigate('budgets')}
          className={`border rounded-xl p-4 text-left transition-colors group ${
            alert.pct >= 100
              ? 'bg-red-50 border-red-200 hover:bg-red-100'
              : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className={alert.pct >= 100 ? 'text-red-600' : 'text-orange-600'} />
            <span className={`text-xs font-medium ${alert.pct >= 100 ? 'text-red-700' : 'text-orange-700'}`}>
              {alert.pct >= 100 ? 'Excedido' : 'Casi al limite'}
            </span>
          </div>
          <p className={`text-sm font-bold ${alert.pct >= 100 ? 'text-red-800' : 'text-orange-800'}`}>
            {alert.category}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs font-[IBM_Plex_Mono] tabular-nums ${alert.pct >= 100 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatCurrency(alert.spent)} / {formatCurrency(alert.limit)}
            </span>
            <span className={`text-xs font-bold ${alert.pct >= 100 ? 'text-red-700' : 'text-orange-700'}`}>
              {alert.pct.toFixed(0)}%
            </span>
          </div>
        </button>
      ))}

      {/* Top spending category */}
      {topCategories.map((tc) => (
        <div
          key={tc.currency}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-slate-600" />
            <span className="text-xs font-medium text-slate-600">
              Mayor gasto{currencies.length > 1 ? ` (${tc.currency})` : ''}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800">{tc.category}</p>
          <p className="text-xs text-slate-500 font-[IBM_Plex_Mono] tabular-nums">
            {formatCurrency(tc.total, tc.currency)} &middot; {tc.pct.toFixed(0)}% del total
          </p>
        </div>
      ))}

      {/* Payment method summary */}
      {paymentBreakdown.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-indigo-600" />
            <span className="text-xs font-medium text-indigo-700">Medios de pago</span>
          </div>
          <div className="space-y-1">
            {paymentBreakdown.map((pm) => (
              <div key={pm.label} className="flex items-center justify-between">
                <span className="text-xs text-indigo-800">{pm.label}</span>
                <span className="text-xs font-bold text-indigo-700">{pm.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
