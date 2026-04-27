import { useState, useEffect, useCallback } from 'react';
import type { Installment, InstallmentPayment } from '../types/finance';
import type { InstallmentsBackupData } from '../types/backup';
import { addMonthsToLocalISODate, getCurrentMonthLocalISO, getTodayLocalISO } from '../utils/date';

const INSTALLMENTS_KEY = 'financas_installments';
const INSTALLMENT_PAYMENTS_KEY = 'financas_installment_payments';

function readStoredValue<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export function useInstallments() {
  const [installments, setInstallments] = useState<Installment[]>(() => readStoredValue(INSTALLMENTS_KEY, []));
  const [payments, setPayments] = useState<InstallmentPayment[]>(() => readStoredValue(INSTALLMENT_PAYMENTS_KEY, []));
  const [isLoaded] = useState(true);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(INSTALLMENTS_KEY, JSON.stringify(installments));
    }
  }, [installments, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(INSTALLMENT_PAYMENTS_KEY, JSON.stringify(payments));
    }
  }, [payments, isLoaded]);

  const addInstallment = useCallback((data: Omit<Installment, 'id' | 'createdAt' | 'paidInstallments'>) => {
    const newInstallment: Installment = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      paidInstallments: 0,
    };

    // Create payment schedule
    const newPayments: InstallmentPayment[] = [];
    
    for (let i = 1; i <= data.totalInstallments; i++) {
      newPayments.push({
        id: crypto.randomUUID(),
        installmentId: newInstallment.id,
        installmentNumber: i,
        amount: data.installmentAmount,
        dueDate: addMonthsToLocalISODate(data.startDate, i - 1),
        isPaid: false,
      });
    }

    setInstallments(prev => [...prev, newInstallment]);
    setPayments(prev => [...prev, ...newPayments]);
    
    return newInstallment;
  }, []);

  const payInstallment = useCallback((installmentId: string, installmentNumber: number) => {
    setPayments(prev => prev.map(payment => {
      if (payment.installmentId === installmentId && payment.installmentNumber === installmentNumber) {
        return {
          ...payment,
          isPaid: true,
          paidDate: getTodayLocalISO(),
        };
      }
      return payment;
    }));

    // Update paid count
    setInstallments(prev => prev.map(inst => {
      if (inst.id === installmentId) {
        const newPaidCount = inst.paidInstallments + 1;
        return {
          ...inst,
          paidInstallments: newPaidCount,
          isActive: newPaidCount < inst.totalInstallments,
        };
      }
      return inst;
    }));
  }, []);

  const deleteInstallment = useCallback((id: string) => {
    setInstallments(prev => prev.filter(inst => inst.id !== id));
    setPayments(prev => prev.filter(payment => payment.installmentId !== id));
  }, []);

  const getInstallmentPayments = useCallback((installmentId: string) => {
    return payments
      .filter(p => p.installmentId === installmentId)
      .sort((a, b) => a.installmentNumber - b.installmentNumber);
  }, [payments]);

  const getActiveInstallments = useCallback(() => {
    return installments.filter(inst => inst.isActive);
  }, [installments]);

  const getTotalRemainingAmount = useCallback(() => {
    return installments
      .filter(inst => inst.isActive)
      .reduce((sum, inst) => sum + (inst.totalAmount - (inst.installmentAmount * inst.paidInstallments)), 0);
  }, [installments]);

  const getMonthlyInstallmentAmount = useCallback(() => {
    const currentMonth = getCurrentMonthLocalISO();
    return payments
      .filter(p => {
        const paymentMonth = p.dueDate.substring(0, 7);
        return paymentMonth === currentMonth && !p.isPaid;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const getUpcomingPayments = useCallback((days: number = 7) => {
    const today = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return payments
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return !p.isPaid && dueDate >= today && dueDate <= future;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [payments]);

  const reassignAccountReferences = useCallback((fromAccountId: string, toAccountId: string) => {
    setInstallments(prev =>
      prev.map((installment) =>
        installment.accountId === fromAccountId
          ? { ...installment, accountId: toAccountId }
          : installment
      )
    );
  }, []);

  const replaceAllData = useCallback((data: InstallmentsBackupData) => {
    setInstallments(data.installments);
    setPayments(data.payments);
  }, []);

  return {
    installments,
    payments,
    isLoaded,
    addInstallment,
    payInstallment,
    deleteInstallment,
    getInstallmentPayments,
    getActiveInstallments,
    getTotalRemainingAmount,
    getMonthlyInstallmentAmount,
    getUpcomingPayments,
    reassignAccountReferences,
    replaceAllData,
  };
}
