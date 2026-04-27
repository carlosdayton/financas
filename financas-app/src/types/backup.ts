import type { AlertPreferencesState } from '../components/AlertPreferences';
import type { Account, Budget, Category, Goal, Installment, InstallmentPayment, RecurringTransaction, Transaction } from './finance';

export interface FinanceBackupData {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  accounts: Account[];
  recurring: RecurringTransaction[];
  budgets: Budget[];
}

export interface InstallmentsBackupData {
  installments: Installment[];
  payments: InstallmentPayment[];
}

export interface AppBackupData {
  version: '2.0';
  exportDate: string;
  finance: FinanceBackupData;
  installments: InstallmentsBackupData;
  preferences: {
    alertPreferences: AlertPreferencesState;
    theme: 'dark' | 'light';
  };
}

export interface LegacyTransactionsBackupData {
  transactions: Transaction[];
  exportDate?: string;
  version?: string;
}
