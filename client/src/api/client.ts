/**
 * VaultFlow REST API Client
 * Communicates with the Spring Boot backend using real JWT authentication.
 * No dummy data fallbacks. Sends Bearer token and triggers 401 logout.
 */

import { Transaction, CategoryBudget, User } from '../types';

export const TOKEN_STORAGE_KEY = 'vaultflow_jwt_token';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export interface ApiError {
  status: number;
  error: string;
  message: string;
  details?: string[];
}

export class ApiException extends Error {
  status: number;
  error: string;
  details?: string[];

  constructor(status: number, error: string, message: string, details?: string[]) {
    super(message || error || `HTTP Error ${status}`);
    this.name = 'ApiException';
    this.status = status;
    this.error = error;
    this.details = details;
  }
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiException(
      0,
      'Network Error',
      'Unable to reach backend server. Please verify connection and that the Spring Boot server is running.'
    );
  }

  if (res.status === 401) {
    // Intercept 401 Unauthorized -> clear token and notify application
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('vaultflow:unauthorized'));
    
    let errorJson: any = null;
    try {
      errorJson = await res.json();
    } catch {
      // ignore
    }
    throw new ApiException(
      401,
      'Unauthorized',
      errorJson?.message || 'Authentication session expired or invalid credentials. Please sign in.'
    );
  }

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }
    throw new ApiException(
      res.status,
      errorData.error || 'Request Failed',
      (Array.isArray(errorData.details) && errorData.details.length > 0
        ? Array.from(new Set<string>(errorData.details.map((d: string) => d.replace(/^\w+:\s*/, '')))).join(' ')
        : errorData.message) || `Request failed with status ${res.status}`,
      errorData.details
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return await res.json() as T;
}

export const apiClient = {
  // Authentication Endpoints
  async register(name: string, email: string, password?: string, currencyCode?: string, startingBalance?: number): Promise<{ user: User; token: string }> {
    return await apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        currencyCode: currencyCode || 'USD',
        startingBalance: startingBalance || 0,
      }),
    });
  },

  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    return await apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getCurrentUser(): Promise<User> {
    return await apiFetch<User>('/api/auth/me', {
      method: 'GET',
    });
  },

  async updateProfile(name: string, currencyCode: string, startingBalance: number): Promise<User> {
    return await apiFetch<User>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name, currencyCode, startingBalance }),
    });
  },

  // Transactions Endpoints
  async fetchTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters?.search?.trim()) params.set('search', filters.search.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await apiFetch<{ transactions: Transaction[]; count: number }>(`/api/transactions${queryString}`, {
      method: 'GET',
    });
    return data.transactions || [];
  },

  async createTransaction(tx: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    notes?: string;
    paymentMethod?: string;
  }): Promise<Transaction> {
    const data = await apiFetch<{ transaction: Transaction }>(`/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(tx),
    });
    return data.transaction;
  },

  async updateTransaction(id: string, tx: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    notes?: string;
    paymentMethod?: string;
  }): Promise<Transaction> {
    const data = await apiFetch<{ transaction: Transaction }>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx),
    });
    return data.transaction;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const data = await apiFetch<{ success: boolean }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    return data.success;
  },

  // Budgets Endpoints
  async fetchBudgets(): Promise<CategoryBudget[]> {
    const data = await apiFetch<{ budgets: CategoryBudget[]; count: number }>(`/api/budgets`, {
      method: 'GET',
    });
    return data.budgets || [];
  },

  async saveBudget(category: string, limit: number, period: string = 'monthly'): Promise<CategoryBudget> {
    const data = await apiFetch<{ budget: CategoryBudget }>(`/api/budgets`, {
      method: 'POST',
      body: JSON.stringify({ category, limit, period }),
    });
    return data.budget;
  },

  async deleteBudget(id: string): Promise<boolean> {
    const data = await apiFetch<{ success: boolean }>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
    return data.success;
  },
};
