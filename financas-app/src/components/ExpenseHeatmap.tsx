import { useMemo } from 'react';
import { Flame, Calendar } from 'lucide-react';
import type { Transaction } from '../types/finance';

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
  const heatmapData = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthTransactions = transactions.filter(
      t => t.date.startsWith(currentMonth) && t.type === 'expense'
    );

    const dayMap = new Map<string, DayData>();
    
    monthTransactions.forEach(t => {
      const date = t.date;
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
      
      const data = dayMap.get(date)!;
      data.amount += t.amount;
      data.count += 1;
    });

    return Array.from(dayMap.values()).sort((a, b) => a.day - b.day);
  }, [transactions]);

  const stats = useMemo(() => {
    if (heatmapData.length === 0) return null;

    const amounts = heatmapData.map(d => d.amount);
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const totalDays = heatmapData.length;
    const totalSpent = amounts.reduce((a, b) => a + b, 0);

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

  const getIntensityLabel = (amount: number, maxAmount: number) => {
    void getIntensityLabel; // Mark as used
    if (maxAmount === 0) return 'Sem gastos';
    const intensity = amount / maxAmount;
    
    if (intensity < 0.2) return 'Baixo';
    if (intensity < 0.4) return 'Moderado';
    if (intensity < 0.6) return 'Médio';
    if (intensity < 0.8) return 'Alto';
    return 'Muito Alto';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Generate all days of current month
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${new Date().toISOString().substring(0, 7)}-${day.toString().padStart(2, '0')}`;
    const data = heatmapData.find(d => d.day === day);
    return {
      day,
      date: dateStr,
      amount: data?.amount || 0,
      count: data?.count || 0,
    };
  });

  // Split into weeks
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
                <p className="text-[#6b6b8a]">Média/Dia</p>
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
            <p className="text-[#a0a0b8]">Nenhum gasto registrado este mês.</p>
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs text-[#6b6b8a] font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day) => (
                    <div
                      key={day.day}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer group ${
                        getIntensityColor(day.amount, stats?.maxAmount || 1)
                      }`}
                      title={`Dia ${day.day}: ${formatCurrency(day.amount)} em ${day.count} transações`}
                    >
                      <span className="text-xs font-medium text-white">{day.day}</span>
                      {day.amount > 0 && (
                        <span className="text-[10px] text-white/80">
                          {day.count}
                        </span>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#1a1a2e] border border-[#2a2a45] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        <p className="text-xs text-white font-medium">Dia {day.day}</p>
                        <p className="text-xs text-[#a0a0b8]">{formatCurrency(day.amount)}</p>
                        <p className="text-xs text-[#6b6b8a]">{day.count} transações</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[#2a2a45]">
              <span className="text-xs text-[#6b6b8a]">Menos</span>
              {[
                { color: 'bg-[#252542]', label: 'Zero' },
                { color: 'bg-emerald-500/20', label: 'Baixo' },
                { color: 'bg-emerald-500/40', label: 'Moderado' },
                { color: 'bg-amber-500/40', label: 'Médio' },
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
