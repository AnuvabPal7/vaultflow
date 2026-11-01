export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Housing & Rent'
  | 'Food & Dining'
  | 'Groceries'
  | 'Utilities & Bills'
  | 'Transportation'
  | 'Shopping & Personal'
  | 'Entertainment & Leisure'
  | 'Healthcare & Medical'
  | 'Education'
  | 'Travel'
  | 'Subscriptions'
  | 'Other Expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance & Contract'
  | 'Investments & Dividends'
  | 'Bonus & Incentives'
  | 'Business'
  | 'Gifts & Grants'
  | 'Other Income';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'bank_transfer'
  | 'crypto'
  | 'other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  notes: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface CategoryBudget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  limit: number;
  period: 'monthly';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currencyCode: string;
  startingBalance: number;
  createdAt: string;
}

export type DateRangeFilter = 'all' | 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'custom';
export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  dateRange: DateRangeFilter;
  startDate?: string;
  endDate?: string;
  sortBy: SortOption;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}
