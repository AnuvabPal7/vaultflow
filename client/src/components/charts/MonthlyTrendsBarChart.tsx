import React from 'react';
import { useFinance, MonthlyTrendData } from '../../context/FinanceContext';
import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const MonthlyTrendsBarChart: React.FC = () => {
  const { monthlyTrends, formatCurrency } = useFinance();

  // Last 6 months for clean layout
  const displayMonths = monthlyTrends.slice(-6);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const incomeVal = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const expenseVal = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const net = incomeVal - expenseVal;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white">
          <p className="font-semibold text-slate-200 mb-1.5">{label}</p>
          <div className="space-y-1 font-mono tabular-nums">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Income:
              </span>
              <span>+{formatCurrency(incomeVal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-xs bg-rose-500" /> Expense:
              </span>
              <span>-{formatCurrency(expenseVal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-700 font-bold">
              <span className="text-slate-300">Net Flow:</span>
              <span className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(net, { showSign: true })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Cash Flow & Monthly Trends
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Income vs. Expenses across recent months (Recharts)
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {displayMonths.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            No monthly trends available
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log transactions across months to visualize longitudinal spending trends.
          </p>
        </div>
      ) : (
        <div className="pt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayMonths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatCurrency(val, { compact: true })}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
