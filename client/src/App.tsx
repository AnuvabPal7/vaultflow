/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { CategoryPieChart } from './components/charts/CategoryPieChart';
import { MonthlyTrendsBarChart } from './components/charts/MonthlyTrendsBarChart';
import { BudgetSection } from './components/BudgetSection';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { ExportModal } from './components/ExportModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { Transaction } from './types';
import { Toaster } from 'react-hot-toast';
import {
  Calendar,
  Plus,
  Target,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentMonthStats, formatCurrency } = useFinance();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'charts' | 'budgets'>('dashboard');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vaultflow_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vaultflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vaultflow_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Verifying security token with backend...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast notifications handler */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            fontSize: '0.75rem',
          },
        }}
      />

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setTransactionToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* When not authenticated, show sign in hero prompt */}
      {!isAuthenticated ? (
        <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Secure Personal Finance Vault
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Please sign in or register to access your personal finance ledger, transaction records, and budget monitoring.
            Protected by Spring Security with JWT &amp; MongoDB.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign In or Register
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Welcome Kicker & Actions Header */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{todayFormatted}</span>
                <span aria-hidden="true">•</span>
                <span>Personal Finance Ledger</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {greeting}, {user?.name || 'User'}
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                Export
              </button>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(true)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap shrink-0"
              >
                <Target className="w-4 h-4 text-indigo-500" />
                Set Budget
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xs whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Record Transaction
              </button>
            </div>
          </section>

          {/* 1. Metric Summary Cards */}
          <section aria-label="Key financial metrics">
            <StatsCards
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onOpenAddModal={() => {
                setTransactionToEdit(null);
                setIsAddModalOpen(true);
              }}
            />
          </section>

          {/* Dynamic View rendering */}
          {activeTab === 'dashboard' && (
            <>
              {/* 2. Visual Charts Row (Recharts) */}
              <section aria-label="Visual Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPieChart
                  onOpenAddModal={() => {
                    setTransactionToEdit(null);
                    setIsAddModalOpen(true);
                  }}
                />
                <MonthlyTrendsBarChart />
              </section>

              {/* 3. Budget Caps Section */}
              <section aria-label="Monthly Category Budgets">
                <BudgetSection onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />
              </section>

              {/* 4. Transactions Ledger */}
              <section aria-label="Transaction Ledger">
                <TransactionList
                  onOpenAddModal={() => {
                    setTransactionToEdit(null);
                    setIsAddModalOpen(true);
                  }}
                  onOpenEditModal={(tx) => {
                    setTransactionToEdit(tx);
                    setIsAddModalOpen(true);
                  }}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                />
              </section>
            </>
          )}

          {activeTab === 'transactions' && (
            <section aria-label="Transactions View">
              <TransactionList
                onOpenAddModal={() => {
                  setTransactionToEdit(null);
                  setIsAddModalOpen(true);
                }}
                onOpenEditModal={(tx) => {
                  setTransactionToEdit(tx);
                  setIsAddModalOpen(true);
                }}
                onOpenExportModal={() => setIsExportModalOpen(true)}
              />
            </section>
          )}

          {activeTab === 'charts' && (
            <section aria-label="Analytics & Trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPieChart
                  onOpenAddModal={() => {
                    setTransactionToEdit(null);
                    setIsAddModalOpen(true);
                  }}
                />
                <MonthlyTrendsBarChart />
              </div>
              <BudgetSection onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />
            </section>
          )}

          {activeTab === 'budgets' && (
            <section aria-label="Budgets View" className="space-y-6">
              <BudgetSection onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Budget Guidelines & Savings Health
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Current month budget utilization is at{' '}
                  <strong className="text-slate-900 dark:text-white tabular-nums">
                    {currentMonthStats.budgetTotal > 0
                      ? ((currentMonthStats.budgetSpent / currentMonthStats.budgetTotal) * 100).toFixed(1)
                      : 0}
                    %
                  </strong>
                  . Total allocated budget is {formatCurrency(currentMonthStats.budgetTotal)} with{' '}
                  {formatCurrency(currentMonthStats.budgetRemaining)} remaining safe spending headroom.
                </p>
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Modify Category Limits
                </button>
              </div>
            </section>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">VaultFlow</span>
            <span aria-hidden="true">•</span>
            <span>Personal Finance & Spending Intelligence (Spring Boot + MongoDB + React)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Export Ledger
            </button>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Currency & Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTransactionToEdit(null);
        }}
        transactionToEdit={transactionToEdit}
      />
      <BudgetManagerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen || !isAuthenticated}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
