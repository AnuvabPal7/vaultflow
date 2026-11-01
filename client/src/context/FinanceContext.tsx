/**
 * Finance Context
 * Loads and persists all transactions and budgets directly to the Spring Boot REST API.
 * No localStorage persistence of transactions or budgets.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Transaction,
  CategoryBudget,
  ExpenseCategory,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
} from '../types';
import { CURRENCIES, CATEGORY_COLORS } from '../data/mockData';
import { useAuth } from './AuthContext';
import { apiClient } from '../api/client';

export interface CategorySummary {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyTrendData {
  monthKey: string; // YYYY-MM
  label: string;    // e.g. "Oct 2026"
  income: number;
  expense: number;
  net: number;
}

export interface BudgetStatus {
  id: string;
  category: ExpenseCategory;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface TransactionFilterParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: string;
  search?: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  isLoading: boolean;
  currencySymbol: string;
  formatCurrency: (amount: number, options?: { showSign?: boolean; compact?: boolean }) => string;
  refreshTransactions: (filters?: TransactionFilterParams) => Promise<void>;
  refreshBudgets: () => Promise<void>;
  addTransaction: (data: {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    notes: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Transaction>;
  editTransaction: (id: string, data: {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    notes: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudget: (category: ExpenseCategory, limit: number) => Promise<CategoryBudget>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Real-time calculated stats
  currentMonthKey: string;
  allTimeStats: {
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
    totalBalance: number;
  };
  currentMonthStats: {
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
    budgetTotal: number;
    budgetSpent: number;
    budgetRemaining: number;
  };
  expenseCategoryBreakdown: CategorySummary[];
  incomeCategoryBreakdown: CategorySummary[];
  monthlyTrends: MonthlyTrendData[];
  budgetStatuses: BudgetStatus[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch transactions from API
  const refreshTransactions = useCallback(async (filters?: TransactionFilterParams) => {
    if (!isAuthenticated) {
      setTransactions([]);
      return;
    }
    try {
      setIsLoading(true);
      const list = await apiClient.fetchTransactions(filters);
      setTransactions(list);
    } catch (err) {
      console.error('Failed to fetch transactions from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch budgets from API
  const refreshBudgets = useCallback(async () => {
    if (!isAuthenticated) {
      setBudgets([]);
      return;
    }
    try {
      const list = await apiClient.fetchBudgets();
      setBudgets(list);
    } catch (err) {
      console.error('Failed to fetch budgets from API:', err);
    }
  }, [isAuthenticated]);

  // Load initial data on authentication state change
  useEffect(() => {
    if (isAuthenticated) {
      refreshTransactions();
      refreshBudgets();
    } else {
      setTransactions([]);
      setBudgets([]);
    }
  }, [isAuthenticated, refreshTransactions, refreshBudgets]);

  const currencyConfig = useMemo(() => {
    const code = user?.currencyCode || 'USD';
    return CURRENCIES[code] || CURRENCIES.USD;
  }, [user?.currencyCode]);

  const formatCurrency = (
    amount: number,
    options?: { showSign?: boolean; compact?: boolean }
  ): string => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);

    let formattedVal = '';
    if (options?.compact && absVal >= 1000) {
      formattedVal = new Intl.NumberFormat(currencyConfig.locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(absVal);
    } else {
      formattedVal = new Intl.NumberFormat(currencyConfig.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absVal);
    }
    const symbol = currencyConfig.symbol;
    const sign = options?.showSign ? (isNegative ? '- ' : '+ ') : (isNegative ? '- ' : '');
    return `${sign}${symbol}${formattedVal}`;
  };

  const addTransaction = async (data: {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    notes: string;
    paymentMethod: PaymentMethod;
  }): Promise<Transaction> => {
    const created = await apiClient.createTransaction({
      ...data,
      amount: Math.abs(Number(data.amount)),
    });
    setTransactions((prev) => [created, ...prev]);
    return created;
  };

  const editTransaction = async (id: string, data: {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    notes: string;
    paymentMethod: PaymentMethod;
  }): Promise<Transaction> => {
    const updated = await apiClient.updateTransaction(id, {
      ...data,
      amount: Math.abs(Number(data.amount)),
    });
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    await apiClient.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const setBudget = async (category: ExpenseCategory, limit: number): Promise<CategoryBudget> => {
    const cleanLimit = Math.max(0, Number(limit));
    const saved = await apiClient.saveBudget(category, cleanLimit, 'monthly');
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category === category);
      if (idx !== -1) {
        return prev.map((b) => (b.category === category ? saved : b));
      }
      return [...prev, saved];
    });
    return saved;
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await apiClient.deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Determine current active month
  const currentMonthKey = useMemo(() => {
    if (transactions.length > 0) {
      const dates = transactions.map((t) => t.date).sort().reverse();
      return dates[0].slice(0, 7);
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, [transactions]);

  // Compute all-time stats
  const allTimeStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    const net = income - expense;
    const savingsRate = income > 0 ? Math.max(0, (net / income) * 100) : 0;
    const startingBalance = user?.startingBalance || 0;
    const totalBalance = startingBalance + net;
    return {
      income,
      expense,
      net,
      savingsRate,
      totalBalance,
    };
  }, [transactions, user?.startingBalance]);

  // Compute current month stats
  const currentMonthStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.date.startsWith(currentMonthKey)) {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      }
    }
    const net = income - expense;
    const savingsRate = income > 0 ? Math.max(0, (net / income) * 100) : 0;
    const budgetTotal = budgets.reduce((acc, b) => acc + b.limit, 0);
    const budgetSpent = expense;
    const budgetRemaining = Math.max(0, budgetTotal - budgetSpent);
    return {
      income,
      expense,
      net,
      savingsRate,
      budgetTotal,
      budgetSpent,
      budgetRemaining,
    };
  }, [transactions, currentMonthKey, budgets]);

  // Expense Category Breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    let totalExpense = 0;
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        const current = map.get(tx.category) || { amount: 0, count: 0 };
        map.set(tx.category, {
          amount: current.amount + tx.amount,
          count: current.count + 1,
        });
        totalExpense += tx.amount;
      }
    }
    const list: CategorySummary[] = [];
    map.forEach((val, category) => {
      const percentage = totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0;
      list.push({
        category: category as TransactionCategory,
        amount: val.amount,
        percentage,
        count: val.count,
        color: CATEGORY_COLORS[category] || '#64748b',
      });
    });
    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Income Category Breakdown
  const incomeCategoryBreakdown = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    let totalIncome = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') {
        const current = map.get(tx.category) || { amount: 0, count: 0 };
        map.set(tx.category, {
          amount: current.amount + tx.amount,
          count: current.count + 1,
        });
        totalIncome += tx.amount;
      }
    }
    const list: CategorySummary[] = [];
    map.forEach((val, category) => {
      const percentage = totalIncome > 0 ? (val.amount / totalIncome) * 100 : 0;
      list.push({
        category: category as TransactionCategory,
        amount: val.amount,
        percentage,
        count: val.count,
        color: CATEGORY_COLORS[category] || '#059669',
      });
    });
    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Monthly trends for Bar Chart
  const monthlyTrends = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      const mKey = tx.date.slice(0, 7); // e.g. "2026-10"
      const curr = map.get(mKey) || { income: 0, expense: 0 };
      if (tx.type === 'income') {
        curr.income += tx.amount;
      } else {
        curr.expense += tx.amount;
      }
      map.set(mKey, curr);
    }
    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((key) => {
      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const stats = map.get(key)!;
      return {
        monthKey: key,
        label,
        income: stats.income,
        expense: stats.expense,
        net: stats.income - stats.expense,
      };
    });
  }, [transactions]);

  // Category Budgets vs Current Month Spending
  const budgetStatuses = useMemo(() => {
    const spentByCategory = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonthKey)) {
        const prev = spentByCategory.get(tx.category) || 0;
        spentByCategory.set(tx.category, prev + tx.amount);
      }
    }
    return budgets.map((b) => {
      const spent = spentByCategory.get(b.category) || 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      const remaining = Math.max(0, b.limit - spent);
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 80) {
        status = 'warning';
      }
      return {
        id: b.id,
        category: b.category as ExpenseCategory,
        limit: b.limit,
        spent,
        percentage,
        remaining,
        status,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions, currentMonthKey]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        isLoading,
        currencySymbol: currencyConfig.symbol,
        formatCurrency,
        refreshTransactions,
        refreshBudgets,
        addTransaction,
        editTransaction,
        deleteTransaction,
        setBudget,
        deleteBudget,
        currentMonthKey,
        allTimeStats,
        currentMonthStats,
        expenseCategoryBreakdown,
        incomeCategoryBreakdown,
        monthlyTrends,
        budgetStatuses,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
