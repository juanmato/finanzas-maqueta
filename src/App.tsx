import { useState } from 'react';
import type { Transaction, Budget, ViewTab } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getCurrentMonth, getMonthLabel, filterByMonth, getMonthOptions } from './utils/helpers';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import MonthlyTrend from './components/MonthlyTrend';
import BudgetManager from './components/BudgetManager';
import ImportXls from './components/ImportXls';
import PendingTransactions from './components/PendingTransactions';
import { LayoutDashboard, List, Target, FileSpreadsheet, Clock } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('fin-transactions', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('fin-budgets', []);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [tab, setTab] = useState<ViewTab>('dashboard');

  const approvedTransactions = transactions.filter((t) => t.status === 'approved');
  const monthTransactions = filterByMonth(approvedTransactions, selectedMonth);
  const monthOptions = getMonthOptions(transactions);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  function addTransaction(t: Transaction) {
    setTransactions((prev) => [...prev, t]);
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function handleImport(imported: Transaction[]) {
    setTransactions((prev) => [...prev, ...imported]);
    setTab('pending');
  }

  function handleApprove(id: string, updates: Partial<Transaction>) {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, status: 'approved' as const } : t
      )
    );
  }

  function handleApproveAll() {
    setTransactions((prev) =>
      prev.map((t) => (t.status === 'pending' ? { ...t, status: 'approved' as const } : t))
    );
  }

  function handleReject(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function handleRejectAll() {
    setTransactions((prev) => prev.filter((t) => t.status !== 'pending'));
  }

  const tabs: { id: ViewTab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transacciones', icon: List },
    { id: 'budgets', label: 'Presupuestos', icon: Target },
    { id: 'import', label: 'Importar', icon: FileSpreadsheet },
    { id: 'pending', label: 'Pendientes', icon: Clock, badge: pendingCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            <span className="text-indigo-600">$</span> MisFinanzas
          </h1>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            ))}
          </select>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.badge ? (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {tab === 'dashboard' && (
          <>
            <SummaryCards transactions={monthTransactions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart transactions={monthTransactions} />
              <MonthlyTrend transactions={approvedTransactions} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransactionForm onAdd={addTransaction} />
              </div>
              <div className="lg:col-span-2">
                <TransactionList transactions={monthTransactions} onDelete={deleteTransaction} />
              </div>
            </div>
          </>
        )}

        {tab === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TransactionForm onAdd={addTransaction} />
            </div>
            <div className="lg:col-span-2">
              <TransactionList transactions={monthTransactions} onDelete={deleteTransaction} />
            </div>
          </div>
        )}

        {tab === 'budgets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetManager
              budgets={budgets}
              onSetBudgets={setBudgets}
              transactions={monthTransactions}
              selectedMonth={selectedMonth}
            />
            <ExpenseChart transactions={monthTransactions} />
          </div>
        )}

        {tab === 'import' && (
          <ImportXls onImport={handleImport} />
        )}

        {tab === 'pending' && (
          <PendingTransactions
            transactions={transactions}
            onApprove={handleApprove}
            onApproveAll={handleApproveAll}
            onReject={handleReject}
            onRejectAll={handleRejectAll}
          />
        )}
      </main>
    </div>
  );
}

export default App;
