import { Installments } from '../components/Installments';
import type { Installment, InstallmentPayment } from '../types/finance';

interface InstallmentsPageProps {
  installments: Installment[];
  onAddInstallment: (data: Omit<Installment, 'id' | 'createdAt' | 'paidInstallments'>) => void;
  onPayInstallment: (installmentId: string, installmentNumber: number) => void;
  onDeleteInstallment: (id: string) => void;
  getInstallmentPayments: (installmentId: string) => InstallmentPayment[];
}

export function InstallmentsPage(props: InstallmentsPageProps) {
  return (
    <div className="space-y-6">
      <Installments {...props} />
    </div>
  );
}
