import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Moon,
  Sun,
  LogOut,
  Plus,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'transactions' | 'charts' | 'budgets';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'charts' | 'budgets') => void;
  onOpenAddModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenProfileModal,
  onOpenAuthModal,
  darkMode,
  toggleDarkMode,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              VF
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
            >
              VaultFlow
            </a>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap transition-colors pb-0.5 ${
                activeTab === 'dashboard'
                  ? 'text-slate-900 dark:text-white font-semibold border-b-2 border-slate-900 dark:border-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`whitespace-nowrap transition-colors pb-0.5 ${
                activeTab === 'transactions'
                  ? 'text-slate-900 dark:text-white font-semibold border-b-2 border-slate-900 dark:border-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Transactions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('charts')}
              className={`whitespace-nowrap transition-colors pb-0.5 ${
                activeTab === 'charts'
                  ? 'text-slate-900 dark:text-white font-semibold border-b-2 border-slate-900 dark:border-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Analytics &amp; Trends
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className={`whitespace-nowrap transition-colors pb-0.5 ${
                activeTab === 'budgets'
                  ? 'text-slate-900 dark:text-white font-semibold border-b-2 border-slate-900 dark:border-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Budgets
            </button>
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Transaction</span>
                  <span className="sm:hidden">Add</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden lg:inline text-xs font-medium max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-xs"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Settings &amp; Currency
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left border-t border-slate-100 dark:border-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
