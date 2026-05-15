import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Transaction, RecurringTransaction, Installment, InstallmentPayment } from '../types/finance';
import { getCurrentMonthLocalISO, shiftMonthLocalISO } from '../utils/date';

interface Props {
  transactions: Transaction[];
  recurring: RecurringTransaction[];
  installments: Installment[];
  payments: InstallmentPayment[];
  accountBalances: Record<string, number>;
}

export function CashFlowProjection({ transactions, recurring, installments, payments, accountBalances }: Props) {
  const data = useMemo(() => {
    const currentMonth = getCurrentMonthLocalISO();
    const currentBalance = Object.values(accountBalances).reduce((s, b) => s + b, 0);

    const last3 = [-3, -2, -1].map(n => shiftMonthLocalISO(currentMonth, n));
    const varTx = transactions.filter(t => !t.isTransfer && !t.isRecurring && last3.some(m => t.date.startsWith(m)));
    const avgVarIncome = varTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) / 3;
    const avgVarExpense = varTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) / 3;

    const points: { month: string; balance: number }[] = [{ month: 'Hoje', balance: Math.round(currentBalance) }];
    let balance = currentBalance;

    for (let i = 1; i <= 6; i++) {
      const month = shiftMonthLocalISO(currentMonth, i);
      const [y, m] = month.split('-').map(Number);

      for (const r of recurring) {
        if (!r.isActive) continue;
        if (r.endDate && r.endDate < month) continue;
        if (r.startDate > `${month}-31`) continue;

        let occ = 0;
        if (r.frequency === 'monthly') occ = 1;
        else if (r.frequency === 'weekly') occ = 4;
        else if (r.frequency === 'daily') occ = new Date(y, m, 0).getDate();
        else if (r.frequency === 'yearly') occ = month.slice(5, 7) === r.startDate.slice(5, 7) ? 1 : 0;

        balance += r.amount * occ * (r.type === 'income' ? 1 : -1);
      }

      for (const p of payments) {
        if (!p.isPaid && p.dueDate.startsWith(month)) balance -= p.amount;
      }

      balance += avgVarIncome - avgVarExpense;

      const label = new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      points.push({ month: label, balance: Math.round(balance) });
    }

    return points;
  }, [transactions, recurring, installments, payments, accountBalances]);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const lastBalance = data[data.length - 1].balance;
  const isPositive = lastBalance >= data[0].balance;
  const minVal = Math.min(...data.map(d => d.balance));
  const color = isPositive ? '#10B981' : '#F43F5E';

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <TrendingUp size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Projeção de Fluxo de Caixa
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Recorrentes + parcelamentos + média variável · 6 meses
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Projeção final</p>
          <p className="font-semibold text-sm" style={{ color }}>{fmt(lastBalance)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(v: number | string) => [fmt(Number(v)), 'Saldo Projetado']}
            contentStyle={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={2}
            fill="url(#cfGrad)"
            dot={{ fill: color, r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {minVal < 0 && (
        <p className="text-xs mt-3" style={{ color: 'var(--accent-warning)' }}>
          ⚠ Saldo projetado negativo — revise recorrências ou parcelamentos.
        </p>
      )}
    </div>
  );
}
