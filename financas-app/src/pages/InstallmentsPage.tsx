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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Parcelamentos</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie suas compras parceladas</p>
        </div>
      </div>

      <Installments {...props} />
    </div>
  );
}
