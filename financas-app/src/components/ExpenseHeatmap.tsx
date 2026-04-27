import { useMemo } from 'react';
import { Flame, Calendar } from 'lucide-react';
import type { Transaction } from '../types/finance';
import { getCurrentMonthLocalISO } from '../utils/date';

interface ExpenseHeatmapProps {
  transactions: Transaction[];
}

interface DayData {
  date: string;
  day: number;
  month: number;
  amount: number;
  count: number;
}

export function ExpenseHeatmap({ transactions }: ExpenseHeatmapProps) {
  const currentMonth = getCurrentMonthLocalISO();

  const heatmapData = useMemo(() => {
    const monthTransactions = transactions.filter(
      (transaction) => transaction.date.startsWith(currentMonth) && transaction.type === 'expense'
    );

    const dayMap = new Map<string, DayData>();

    monthTransactions.forEach((transaction) => {
      const date = transaction.date;
      const day = new Date(date).getDate();
      const month = new Date(date).getMonth();

      if (!dayMap.has(date)) {
        dayMap.set(date, {
          date,
          day,
          month,
          amount: 0,
          count: 0,
        });
      }

      const data = dayMap.get(date);
      if (!data) return;
      data.amount += transaction.amount;
      data.count += 1;
    });

    return Array.from(dayMap.values()).sort((a, b) => a.day - b.day);
  }, [transactions, currentMonth]);

  const stats = useMemo(() => {
    if (heatmapData.length === 0) return null;

    const amounts = heatmapData.map((day) => day.amount);
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);
    const avgAmount = amounts.reduce((left, right) => left + right, 0) / amounts.length;
    const totalDays = heatmapData.length;
    const totalSpent = amounts.reduce((left, right) => left + right, 0);

    return { maxAmount, minAmount, avgAmount, totalDays, totalSpent };
  }, [heatmapData]);

  const getIntensityColor = (amount: number, maxAmount: number) => {
    if (maxAmount === 0) return '';
    const intensity = amount / maxAmount;

    if (intensity < 0.2) return 'bg-emerald-500/20';
    if (intensity < 0.4) return 'bg-emerald-500/40';
    if (intensity < 0.6) return 'bg-amber-500/40';
    if (intensity < 0.8) return 'bg-orange-500/50';
    return 'bg-red-500/60';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${currentMonth}-${day.toString().padStart(2, '0')}`;
    const data = heatmapData.find((item) => item.day === day);

    return {
      day,
      date,
      amount: data?.amount || 0,
      count: data?.count || 0,
    };
  });

  const weeks: typeof allDays[] = [];
  let currentWeek: typeof allDays = [];

  allDays.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === allDays.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-2xl blur-xl" />

      <div className="relative bg-[#16162a] rounded-2xl border border-[#2a2a45] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-lg">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mapa de Calor de Gastos</h2>
              <p className="text-sm text-[#a0a0b8] capitalize">{currentMonthName}</p>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-[#6b6b8a]">Total</p>
                <p className="font-semibold text-white">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#6b6b8a]">Media/Dia</p>
                <p className="font-semibold text-white">{formatCurrency(stats.avgAmount)}</p>
              </div>
            </div>
          )}
        </div>

        {heatmapData.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#252542] rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-[#6b6b8a]" />
            </div>
            <p className="text-[#a0a0b8]">Nenhum gasto registrado este mes.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div key={day} className="text-center text-xs text-[#6b6b8a] font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer group ${
                        getIntensityColor(day.amount, stats?.maxAmount || 1)
                      }`}
                      title={`Dia ${day.day}: ${formatCurrency(day.amount)} em ${day.count} transacoes`}
                    >
                      <span className="text-xs font-medium text-white">{day.day}</span>
                      {day.amount > 0 && (
                        <span className="text-[10px] text-white/80">
                          {day.count}
                        </span>
                      )}

                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#1a1a2e] border border-[#2a2a45] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        <p className="text-xs text-white font-medium">Dia {day.day}</p>
                        <p className="text-xs text-[#a0a0b8]">{formatCurrency(day.amount)}</p>
                        <p className="text-xs text-[#6b6b8a]">{day.count} transacoes</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[#2a2a45]">
              <span className="text-xs text-[#6b6b8a]">Menos</span>
              {[
                { color: 'bg-[#252542]', label: 'Zero' },
                { color: 'bg-emerald-500/20', label: 'Baixo' },
                { color: 'bg-emerald-500/40', label: 'Moderado' },
                { color: 'bg-amber-500/40', label: 'Medio' },
                { color: 'bg-orange-500/50', label: 'Alto' },
                { color: 'bg-red-500/60', label: 'Muito Alto' },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded ${item.color}`}
                  title={item.label}
                />
              ))}
              <span className="text-xs text-[#6b6b8a]">Mais</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
