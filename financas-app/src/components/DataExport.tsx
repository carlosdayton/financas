import { useState } from 'react';
import { FileJson, FileSpreadsheet, Upload, Database } from 'lucide-react';
import type { Transaction } from '../types/finance';
import type { AppBackupData, LegacyTransactionsBackupData } from '../types/backup';
import { getTodayLocalISO } from '../utils/date';

interface DataExportProps {
  transactions: Transaction[];
  backupData: AppBackupData;
  onImport: (data: AppBackupData | LegacyTransactionsBackupData) => void;
}

export function DataExport({ transactions, backupData, onImport }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor'];
    const rows = transactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type === 'income' ? 'Receita' : 'Despesa',
      transaction.amount.toString(),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas-${getTodayLocalISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          alert('Arquivo de backup invalido.');
          return;
        }

        onImport(data);
        setIsOpen(false);
      } catch {
        alert('Erro ao importar arquivo. Verifique se o formato esta correto.');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      >
        <Database className="w-4 h-4" />
        <span>Dados</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl z-50 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Exportar Dados</p>
            </div>

            <button
              onClick={exportToJSON}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FileJson className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-medium">Backup JSON</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Transacoes, contas, metas e configuracoes</p>
              </div>
            </button>

            <button
              onClick={exportToCSV}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium">Planilha CSV</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Para Excel</p>
              </div>
            </button>

            <div className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Importar</p>
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors" style={{ background: 'var(--bg-tertiary)' }}>
                <Upload className="w-5 h-5 text-amber-400" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Restaurar backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
