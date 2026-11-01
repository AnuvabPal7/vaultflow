import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Transaction,
  FilterState,
  SortOption,
} from '../types';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  CreditCard,
  Banknote,
  Building,
  RotateCcw,
  Download,
  Plus,
} from 'lucide-react';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/mockData';
import toast from 'react-hot-toast';

interface TransactionListProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onOpenExportModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenExportModal,
}) => {
  const { transactions, deleteTransaction, refreshTransactions, formatCurrency, isLoading } = useFinance();

  // Filters state
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    dateRange: 'all',
    sortBy: 'date_desc',
  });

  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Trigger server-side filtering when filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      let startDate: string | undefined;
      let endDate: string | undefined;
      const now = new Date();

      if (filterState.dateRange === 'this_month') {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        startDate = `${y}-${m}-01`;
        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
        endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      } else if (filterState.dateRange === 'last_month') {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const y = prev.getFullYear();
        const m = String(prev.getMonth() + 1).padStart(2, '0');
        startDate = `${y}-${m}-01`;
        const lastDay = new Date(y, prev.getMonth() + 1, 0).getDate();
        endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      } else if (filterState.dateRange === 'last_30_days') {
        const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = thirtyAgo.toISOString().slice(0, 10);
        endDate = now.toISOString().slice(0, 10);
      } else if (filterState.dateRange === 'last_90_days') {
        const ninetyAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        startDate = ninetyAgo.toISOString().slice(0, 10);
        endDate = now.toISOString().slice(0, 10);
      }

      refreshTransactions({
        type: filterState.type !== 'all' ? filterState.type : undefined,
        category: filterState.category !== 'all' ? filterState.category : undefined,
        startDate,
        endDate,
        search: filterState.search.trim() || undefined,
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [filterState.type, filterState.category, filterState.dateRange, filterState.search, refreshTransactions]);

  // Client sort presentation
  const sortedTransactions = [...transactions].sort((a, b) => {
    switch (filterState.sortBy) {
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount_desc':
        return b.amount - a.amount;
      case 'amount_asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
  const paginatedList = sortedTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteConfirm = async () => {
    if (!txToDelete) return;
    try {
      setIsDeleting(true);
      await deleteTransaction(txToDelete.id);
      toast.success(`Deleted transaction for ${txToDelete.category}`);
      setTxToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setFilterState({
      search: '',
      type: 'all',
      category: 'all',
      dateRange: 'all',
      sortBy: 'date_desc',
    });
    setCurrentPage(1);
  };

  const renderPaymentIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'bank_transfer':
        return <Building className="w-3.5 h-3.5" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const paymentLabels: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    bank_transfer: 'Bank Transfer',
    cash: 'Cash',
    crypto: 'Crypto',
    other: 'Other',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {transactions.length} verified records retrieved from MongoDB backend
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Server-side queries) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 py-4 border-b border-slate-100 dark:border-slate-800">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes or category..."
            value={filterState.search}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, search: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="lg:col-span-3 flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setFilterState((prev) => ({ ...prev, type: t }));
                setCurrentPage(1);
              }}
              className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all whitespace-nowrap ${
                filterState.type === t
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Category Select */}
        <div className="lg:col-span-3">
          <select
            value={filterState.category}
            onChange={(e) => {
              setFilterState((prev) => ({ ...prev, category: e.target.value }));
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <optgroup label="Expenses">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="Income">
              {INCOME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Date Range / Sort Dropdown */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <select
            value={filterState.sortBy}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
            }
            className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
          {(filterState.search ||
            filterState.type !== 'all' ||
            filterState.category !== 'all' ||
            filterState.dateRange !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      {paginatedList.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {isLoading ? 'Loading records from backend...' : 'No transactions found'}
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search query, type filters, or date range.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedList.map((tx) => {
                const categoryColor = CATEGORY_COLORS[tx.category] || '#64748b';
                const isIncome = tx.type === 'income';

                const dateParts = tx.date.split('-');
                const formattedDate = new Date(
                  parseInt(dateParts[0], 10),
                  parseInt(dateParts[1], 10) - 1,
                  parseInt(dateParts[2], 10)
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                            {tx.notes || tx.category}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
                            {tx.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {tx.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formattedDate}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {renderPaymentIcon(tx.paymentMethod)}
                        <span>{paymentLabels[tx.paymentMethod] || 'Card'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold tabular-nums ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {formatCurrency(isIncome ? tx.amount : -tx.amount, { showSign: true })}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(tx)}
                          title="Edit transaction"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          title="Delete transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded-md transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${
                  currentPage === i + 1
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 rounded-md transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Delete Transaction?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to remove this {formatCurrency(txToDelete.amount)} transaction
              for &quot;{txToDelete.notes || txToDelete.category}&quot;? This will permanently delete the document from MongoDB.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTxToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
