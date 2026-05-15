import { CreditCardControl } from '../components/CreditCardControl';
import type { Account, Transaction } from '../types/finance';

interface CreditCardPageProps {
  accounts: Account[];
  transactions: Transaction[];
  onPayInvoice: (data: {
    accountId: string;
    month: string;
    amount: number;
    paymentAccountId: string;
    paymentDate: string;
  }) => void;
}

export function CreditCardPage({ accounts, transactions, onPayInvoice }: CreditCardPageProps) {
  const creditAccounts = accounts.filter((a) => a.type === 'credit');

  return (
    <div className="space-y-6">
      <CreditCardControl
        creditAccounts={creditAccounts}
        transactions={transactions}
        onPayInvoice={onPayInvoice}
        allAccounts={accounts}
      />
    </div>
  );
}
