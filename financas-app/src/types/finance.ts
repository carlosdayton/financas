export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
  notes?: string;
  accountId?: string;
  isRecurring?: boolean;
  recurringId?: string;
  isTransfer?: boolean;
  transferId?: string;
  transferDirection?: 'in' | 'out';
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionsCount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment';
  balance: number;
  color: string;
  icon: string;
  isDefault?: boolean;
  creditLimit?: number;
  billingDay?: number;
}

export interface CreditCardInvoice {
  id: string;
  accountId: string;
  month: string; // YYYY-MM
  totalAmount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastGenerated?: string;
  accountId?: string;
  isActive: boolean;
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: string;
  category: string;
  accountId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InstallmentPayment {
  id: string;
  installmentId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
  createdAt: string;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
}
