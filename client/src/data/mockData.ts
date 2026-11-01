import { ExpenseCategory, IncomeCategory, CurrencyConfig } from '../types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing & Rent',
  'Food & Dining',
  'Groceries',
  'Utilities & Bills',
  'Transportation',
  'Shopping & Personal',
  'Entertainment & Leisure',
  'Healthcare & Medical',
  'Education',
  'Travel',
  'Subscriptions',
  'Other Expense',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance & Contract',
  'Investments & Dividends',
  'Bonus & Incentives',
  'Business',
  'Gifts & Grants',
  'Other Income',
];

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

export const CATEGORY_COLORS: Record<string, string> = {
  // Expenses
  'Housing & Rent': '#0284c7', // Sky
  'Food & Dining': '#f97316', // Orange
  'Groceries': '#10b981', // Emerald
  'Utilities & Bills': '#6366f1', // Indigo
  'Transportation': '#8b5cf6', // Violet
  'Shopping & Personal': '#ec4899', // Pink
  'Entertainment & Leisure': '#f59e0b', // Amber
  'Healthcare & Medical': '#ef4444', // Red
  'Education': '#14b8a6', // Teal
  'Travel': '#06b6d4', // Cyan
  'Subscriptions': '#a855f7', // Purple
  'Other Expense': '#64748b', // Slate

  // Incomes
  'Salary': '#059669', // Emerald
  'Freelance & Contract': '#2563eb', // Blue
  'Investments & Dividends': '#7c3aed', // Violet
  'Bonus & Incentives': '#d97706', // Amber
  'Business': '#0d9488', // Teal
  'Gifts & Grants': '#db2777', // Pink
  'Other Income': '#475569', // Slate
};
