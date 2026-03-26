import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Transaction } from '../types';
import { MONTHS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

interface Props {
  transactions: Transaction[];
}

export default function MonthlyTrend({ transactions }: Props) {
  const monthly: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const m = t.date.substring(0, 7);
    if (!monthly[m]) monthly[m] = { income: 0, expense: 0 };
    monthly[m][t.type] += t.amount;
  });

  const data = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, vals]) => {
      const [, m] = month.split('-');
      return {
        name: MONTHS[parseInt(m) - 1]?.substring(0, 3) || month,
        Ingresos: vals.income,
        Gastos: vals.expense,
      };
    });

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 animate-fade-in">
        Sin datos para mostrar tendencia
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slide-up stagger-1">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Tendencia mensual</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="Ingresos" fill="#059669" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Gastos" fill="#e63946" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
