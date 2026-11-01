import React, { useState } from 'react';
import { useFinance, CategorySummary } from '../../context/FinanceContext';
import { PieChart as LucidePie, TrendingDown, TrendingUp } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const CategoryPieChart: React.FC<{ onOpenAddModal: () => void }> = ({ onOpenAddModal }) => {
  const { expenseCategoryBreakdown, incomeCategoryBreakdown, formatCurrency } = useFinance();
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const data: CategorySummary[] =
    chartType === 'expense' ? expenseCategoryBreakdown : incomeCategoryBreakdown;
  const totalAmount = data.reduce((acc, curr) => acc + curr.amount, 0);

  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    count: item.count,
    color: item.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-semibold">{p.name}</span>
          </div>
          <div className="text-slate-300 font-mono tabular-nums">
            {formatCurrency(p.value)} ({p.percentage.toFixed(1)}%)
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {p.count} {p.count === 1 ? 'transaction' : 'transactions'}
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
            Category Breakdown
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {chartType === 'expense' ? 'Spending by category' : 'Income distribution'}
          </p>
        </div>
        {/* Switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setChartType('expense')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              chartType === 'expense'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setChartType('income')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              chartType === 'income'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Income
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <LucidePie className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            No {chartType} records yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">
            Add a transaction to generate real-time category visualization charts.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Recharts Pie Donut */}
          <div className="w-full md:w-1/2 h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total {chartType === 'expense' ? 'Spend' : 'Income'}
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-[11px] text-slate-400">
                {chartData.length} categories
              </span>
            </div>
          </div>

          {/* Category List Legend */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
            {chartData.slice(0, 7).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.count} txns • {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums shrink-0 ml-2">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
