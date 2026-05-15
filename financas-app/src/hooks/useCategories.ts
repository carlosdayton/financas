import { useCallback } from 'react';
import type { Category } from '../types/finance';
import { usePersistedState } from './usePersistedState';

const CATEGORIES_KEY = 'financas_categories';

export const defaultCategories: Category[] = [
  { id: '1', name: 'Salário', type: 'income', color: '#22c55e', icon: 'wallet' },
  { id: '2', name: 'Freelance', type: 'income', color: '#16a34a', icon: 'briefcase' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#15803d', icon: 'trending-up' },
  { id: '4', name: 'Alimentação', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { id: '5', name: 'Transporte', type: 'expense', color: '#f97316', icon: 'car' },
  { id: '6', name: 'Moradia', type: 'expense', color: '#eab308', icon: 'home' },
  { id: '7', name: 'Saúde', type: 'expense', color: '#ec4899', icon: 'heart' },
  { id: '8', name: 'Lazer', type: 'expense', color: '#8b5cf6', icon: 'gamepad-2' },
  { id: '9', name: 'Educação', type: 'expense', color: '#3b82f6', icon: 'graduation-cap' },
  { id: '10', name: 'Outros', type: 'expense', color: '#6b7280', icon: 'more-horizontal' },
];

export function useCategories() {
  const [categories, setCategories] = usePersistedState<Category[]>(CATEGORIES_KEY, defaultCategories);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: crypto.randomUUID() };
    setCategories(prev => [...prev, newCategory]);
  }, [setCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCategories]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [setCategories]);

  return {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
