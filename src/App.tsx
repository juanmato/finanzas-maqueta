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
import DashboardInsights from './components/DashboardInsights';
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

  function updateTransaction(id: string, updates: Partial<Transaction>) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
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

      {/* Desktop: top tabs. Mobile: bottom fixed nav */}
      <nav className="bg-white border-b border-gray-100 sm:relative fixed bottom-0 left-0 right-0 z-10 sm:border-b sm:border-t-0 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 flex justify-around sm:justify-start sm:gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-t-2 sm:border-t-0 sm:border-b-2 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-600 ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600 sm:border-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.icon size={18} className="sm:w-4 sm:h-4" />
              <span className="relative">
                {t.label}
                {t.badge ? (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {t.badge > 99 ? '99+' : t.badge}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6 space-y-6 scroll-pt-24">
        {tab === 'dashboard' && (
          <>
            <SummaryCards transactions={monthTransactions} />
            <DashboardInsights
              monthTransactions={monthTransactions}
              allTransactions={transactions}
              budgets={budgets}
              selectedMonth={selectedMonth}
              onNavigate={(t) => setTab(t as ViewTab)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart transactions={monthTransactions} />
              <MonthlyTrend transactions={approvedTransactions} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransactionForm onAdd={addTransaction} />
              </div>
              <div className="lg:col-span-2">
                <TransactionList transactions={monthTransactions} onDelete={deleteTransaction} onUpdate={updateTransaction} />
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
              <TransactionList transactions={monthTransactions} onDelete={deleteTransaction} onUpdate={updateTransaction} />
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
