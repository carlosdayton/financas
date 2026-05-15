import { Categories } from '../components/Categories';
import type { Category } from '../types/finance';

interface CategoriesPageProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoriesPage({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoriesPageProps) {
  return (
    <div className="space-y-6">
      <Categories
        categories={categories}
        onAddCategory={onAddCategory}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
}
