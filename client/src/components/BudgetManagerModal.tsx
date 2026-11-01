import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES } from '../data/mockData';
import { ExpenseCategory } from '../types';
import { X, Target, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { budgets, setBudget, deleteBudget, currencySymbol, formatCurrency } = useFinance();
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const b of budgets) {
      map[b.category] = b.limit.toString();
    }
    return map;
  });
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveCategory = async (category: ExpenseCategory) => {
    const rawVal = budgetValues[category] || '0';
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid positive number for the budget limit.');
      return;
    }

    try {
      setSavingCategory(category);
      await setBudget(category, num);
      toast.success(`${category} budget cap saved to MongoDB (${currencySymbol}${num.toFixed(0)}/mo)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save budget');
    } finally {
      setSavingCategory(null);
    }
  };

  const handleDelete = async (category: ExpenseCategory) => {
    const existing = budgets.find((b) => b.category === category);
    if (existing) {
      try {
        await deleteBudget(existing.id);
        setBudgetValues((prev) => ({ ...prev, [category]: '' }));
        toast.success(`Removed budget cap for ${category}`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete budget');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Monthly Category Budgets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set monthly spending limits for each category (persisted in MongoDB).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable category list */}
        <div className="overflow-y-auto py-4 space-y-3 pr-1 flex-1">
          {EXPENSE_CATEGORIES.map((cat) => {
            const currentVal = budgetValues[cat] !== undefined
              ? budgetValues[cat]
              : (budgets.find((b) => b.category === cat)?.limit.toString() || '');
            const existingBudget = budgets.find((b) => b.category === cat);
            const isSaving = savingCategory === cat;

            return (
              <div
                key={cat}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {cat}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {existingBudget
                      ? `Active: ${formatCurrency(existingBudget.limit)} / month`
                      : 'No monthly cap set'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="0"
                      value={currentVal}
                      onChange={(e) =>
                        setBudgetValues((prev) => ({ ...prev, [cat]: e.target.value }))
                      }
                      className="w-full pl-6 pr-2 py-1.5 text-xs tabular-nums bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveCategory(cat)}
                    title="Save budget for this category"
                    className="p-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  {existingBudget && (
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      title="Clear budget cap"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
