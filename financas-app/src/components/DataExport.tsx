import { useState } from 'react';
import { FileJson, FileSpreadsheet, Upload, Database } from 'lucide-react';
import type { Transaction } from '../types/finance';

interface DataExportProps {
  transactions: Transaction[];
  onImport: (data: Transaction[]) => void;
}

export function DataExport({ transactions, onImport }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToJSON = () => {
    const data = {
      transactions,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toString(),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financas-${new Date().toISOString().split('T')[0]}.csv`;
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
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions)) {
          onImport(data.transactions);
          setIsOpen(false);
        }
      } catch (error) {
        alert('Erro ao importar arquivo. Verifique se o formato está correto.');
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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
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
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inclui todos os dados</p>
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
