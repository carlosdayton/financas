import { useCallback } from 'react';
import type { Goal } from '../types/finance';
import { usePersistedState } from './usePersistedState';

const GOALS_KEY = 'financas_goals';

export function useGoals() {
  const [goals, setGoals] = usePersistedState<Goal[]>(GOALS_KEY, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
    };
    setGoals(prev => [...prev, newGoal]);
  }, [setGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [setGoals]);

  const contributeToGoal = useCallback((goalId: string, amount: number) => {
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
          : g
      )
    );
  }, [setGoals]);

  return {
    goals,
    setGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
  };
}
