import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';

export const StatsCards: React.FC<{ onOpenBudgetModal: () => void; onOpenAddModal: () => void }> = ({
  onOpenBudgetModal,
}) => {
  const { allTimeStats, currentMonthStats, formatCurrency } = useFinance();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Balance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Net Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(allTimeStats.totalBalance)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Lifetime savings</span>
            <span aria-hidden="true">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{formatCurrency(allTimeStats.net, { compact: true })} net
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Income */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Income
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(currentMonthStats.income)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>All time</span>
            <span aria-hidden="true">•</span>
            <span className="tabular-nums font-mono text-slate-700 dark:text-slate-300">
              {formatCurrency(allTimeStats.income, { compact: true })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Monthly Expenses */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Expenses
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight text-rose-600 dark:text-rose-400">
            -{formatCurrency(currentMonthStats.expense)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>All time</span>
            <span aria-hidden="true">•</span>
            <span className="tabular-nums font-mono text-slate-700 dark:text-slate-300">
              {formatCurrency(allTimeStats.expense, { compact: true })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Savings Rate & Monthly Budget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Savings Rate &amp; Budget
          </span>
          <button
            type="button"
            onClick={onOpenBudgetModal}
            title="Manage monthly budgets"
            className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {currentMonthStats.savingsRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Budget: {formatCurrency(currentMonthStats.budgetRemaining, { compact: true })} left
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentMonthStats.budgetTotal === 0
                  ? 'bg-slate-300 dark:bg-slate-700'
                  : currentMonthStats.budgetSpent > currentMonthStats.budgetTotal
                  ? 'bg-rose-500'
                  : currentMonthStats.budgetSpent / currentMonthStats.budgetTotal > 0.8
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{
                width: `${
                  currentMonthStats.budgetTotal > 0
                    ? Math.min(
                        100,
                        (currentMonthStats.budgetSpent / currentMonthStats.budgetTotal) * 100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
