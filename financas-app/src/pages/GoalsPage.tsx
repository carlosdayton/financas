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
