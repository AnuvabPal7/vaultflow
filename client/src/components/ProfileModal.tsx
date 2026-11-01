import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../data/mockData';
import { X, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, token, updateLocalUserState, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currencyCode, setCurrencyCode] = useState(user?.currencyCode || 'USD');
  const [startingBalance, setStartingBalance] = useState((user?.startingBalance || 0).toString());
  const [showToken, setShowToken] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(startingBalance);
    const safeBalance = isNaN(balanceNum) ? 0 : balanceNum;
    if (safeBalance < 0) {
      toast.error('Starting balance cannot be negative');
      return;
    }
    try {
      const updated = await apiClient.updateProfile(name.trim() || user.name, currencyCode, safeBalance);
      updateLocalUserState(updated);
      toast.success('Preferences saved');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save preferences');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              User Profile &amp; Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Account identity, currency, and baseline balance
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

        <form onSubmit={handleSave} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Authenticated Identity)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Display Currency
              </label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Starting Balance
              </label>
              <input
                type="number"
                step="50"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full px-3 py-2 text-xs tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Development-Only Token Inspector: Rendered ONLY in dev mode via import.meta.env.DEV */}
          {import.meta.env.DEV && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  JWT Bearer Token <span className="text-[10px] text-amber-500 font-mono">(Dev-Only)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {showToken ? 'Hide' : 'Inspect'}
                </button>
              </div>
              {showToken && (
                <div className="mt-2 text-[10px] font-mono p-2 bg-slate-900 text-slate-300 rounded-lg break-all select-all">
                  {token || 'No active token'}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                logout();
                toast.success('Signed out successfully.');
                onClose();
              }}
              className="text-xs font-medium text-rose-600 hover:text-rose-700"
            >
              Sign Out
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
