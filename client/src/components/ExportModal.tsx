import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, FileSpreadsheet, FileJson, Printer, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { transactions, allTimeStats } = useFinance();
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes', 'Created At'];
    const rows = transactions.map((tx) => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type}"`,
      `"${tx.category}"`,
      tx.amount.toFixed(2),
      `"${tx.paymentMethod}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
      `"${tx.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vaultflow_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedFormat('csv');
    toast.success(`Exported ${transactions.length} transactions as CSV`);
  };

  // Export as JSON
  const handleExportJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: allTimeStats,
      count: transactions.length,
      transactions,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `vaultflow_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadedFormat('json');
    toast.success('Full transaction ledger exported as JSON');
  };

  // Print Summary
  const handlePrint = () => {
    window.print();
    toast('Print layout prepared', { icon: '🖨️' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              Export Financial Data
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download your transactions or print a statement
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

        <div className="py-5 space-y-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Export as CSV
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Spreadsheet format for Excel, Google Sheets, or accountant
                </span>
              </div>
            </div>
            {downloadedFormat === 'csv' ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
            )}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Export as JSON Backup
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Full structured data backup of all transactions and accounts
                </span>
              </div>
            </div>
            {downloadedFormat === 'json' ? (
              <Check className="w-4 h-4 text-blue-500" />
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Print Financial Statement
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Generate print layout or Save as PDF via browser print
                </span>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
