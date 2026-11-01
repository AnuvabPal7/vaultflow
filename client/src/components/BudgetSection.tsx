import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CATEGORY_COLORS } from '../data/mockData';

export const BudgetSection: React.FC<{ onOpenBudgetModal: () => void }> = ({ onOpenBudgetModal }) => {
  const { budgetStatuses, formatCurrency } = useFinance();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Monthly Category Budgets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending thresholds and pace monitoring (persisted in MongoDB)
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenBudgetModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Target className="w-3.5 h-3.5" />
          Manage Caps
        </button>
      </div>

      {budgetStatuses.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No category budgets configured
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Set monthly targets for groceries, rent, and dining to keep expenditures in check.
          </p>
          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg"
          >
            Create Category Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {budgetStatuses.map((item) => {
            const barWidth = Math.min(100, Math.max(0, item.percentage));
            const categoryColor = CATEGORY_COLORS[item.category] || '#64748b';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.category}
                      </span>
                    </div>

                    {item.status === 'danger' ? (
                      <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0">
                        <AlertCircle className="w-3 h-3" />
                        Exceeded
                      </span>
                    ) : item.status === 'warning' ? (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Near limit
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        On track
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Spent:{' '}
                      <strong className="text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatCurrency(item.spent)}
                      </strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      Cap: {formatCurrency(item.limit)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.status === 'danger'
                          ? 'bg-rose-500'
                          : item.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="tabular-nums font-mono">{item.percentage.toFixed(0)}% used</span>
                  <span className="tabular-nums">
                    {item.remaining > 0
                      ? `${formatCurrency(item.remaining)} left`
                      : `${formatCurrency(item.spent - item.limit)} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
