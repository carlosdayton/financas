import { useState } from 'react';
import { FileJson, FileSpreadsheet, Upload, Database, Calendar } from 'lucide-react';
import type { Transaction, Account } from '../types/finance';
import type { AppBackupData, LegacyTransactionsBackupData } from '../types/backup';
import { getTodayLocalISO, getCurrentMonthLocalISO, shiftMonthLocalISO } from '../utils/date';

interface DataExportProps {
  transactions: Transaction[];
  accounts: Account[];
  backupData: AppBackupData;
  onImport: (data: AppBackupData | LegacyTransactionsBackupData) => void;
}

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

export function DataExport({ transactions, accounts, backupData, onImport }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [csvModal, setCsvModal] = useState(false);

  const currentMonth = getCurrentMonthLocalISO();
  const [csvFrom, setCsvFrom] = useState(shiftMonthLocalISO(currentMonth, -2));
  const [csvTo, setCsvTo] = useState(currentMonth);

  // Build list of months available
  const availableMonths = [...new Set(transactions.map((t) => t.date.substring(0, 7)))]
    .sort()
    .reverse();

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas-backup-${getTodayLocalISO()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToCSV = () => {
    const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

    const filtered = transactions
      .filter((t) => {
        const month = t.date.substring(0, 7);
        return month >= csvFrom && month <= csvTo;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)', 'Conta', 'Notas'];
    const rows = filtered.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.isTransfer ? 'Transferência' : t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2).replace('.', ','),
      t.accountId ? accountMap[t.accountId] ?? '' : '',
      t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas-${csvFrom}-a-${csvTo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCsvModal(false);
    setIsOpen(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const data = JSON.parse(loadEvent.target?.result as string);
        const hasModernBackup =
          data &&
          data.finance &&
          Array.isArray(data.finance.transactions) &&
          Array.isArray(data.finance.accounts) &&
          data.installments &&
          Array.isArray(data.installments.installments) &&
          data.preferences;
        const hasLegacyBackup = data && Array.isArray(data.transactions);

        if (!hasModernBackup && !hasLegacyBackup) {
          alert('Arquivo de backup inválido.');
          return;
        }

        onImport(data);
        setIsOpen(false);
      } catch {
        alert('Erro ao importar arquivo. Verifique se o formato está correto.');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      {/* CSV Period Modal */}
      {csvModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setCsvModal(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar className="w-5 h-5 text-emerald-400" />
              Exportar CSV por Período
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>De (mês)</label>
                <select
                  value={csvFrom}
                  onChange={(e) => setCsvFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>{formatMonth(m)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Até (mês)</label>
                <select
                  value={csvTo}
                  onChange={(e) => setCsvTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>{formatMonth(m)}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Exporta: data, descrição, categoria, tipo, valor, conta e notas.
                Abre direto no Excel (BOM UTF-8).
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setCsvModal(false)}
                className="flex-1 py-2.5 rounded-2xl text-sm transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                Cancelar
              </button>
              <button
                onClick={exportToCSV}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all"
              >
                Baixar CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 sm:w-auto items-center justify-center gap-2 rounded-2xl px-0 sm:px-4 py-2 transition-all"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">Dados</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="fixed right-3 top-16 w-[calc(100vw-1.5rem)] max-w-72 rounded-2xl shadow-xl z-50 overflow-hidden sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-64" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Exportar Dados</p>
              </div>

              <button
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-[var(--bg-tertiary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <FileJson className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium">Backup JSON</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Transações, contas, metas e configurações</p>
                </div>
              </button>

              <button
                onClick={() => { setIsOpen(false); setCsvModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-[var(--bg-tertiary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium">Planilha CSV</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Para Excel — por período</p>
                </div>
              </button>

              <div className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Importar</p>
                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-colors hover:bg-[var(--bg-secondary)]" style={{ background: 'var(--bg-tertiary)' }}>
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Restaurar backup</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
