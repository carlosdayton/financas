import { Goals } from '../components/Goals';
import type { Goal } from '../types/finance';

interface GoalsPageProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onContribute: (goalId: string, amount: number) => void;
}

export function GoalsPage({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onContribute,
}: GoalsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Metas Financeiras</h2>
        <p className="text-[#a0a0b8]">Defina e acompanhe seus objetivos</p>
      </div>

      <Goals
        goals={goals}
        onAddGoal={onAddGoal}
        onUpdateGoal={onUpdateGoal}
        onDeleteGoal={onDeleteGoal}
        onContribute={onContribute}
      />
    </div>
  );
}
