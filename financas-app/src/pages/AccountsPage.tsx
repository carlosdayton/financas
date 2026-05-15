import { Accounts } from '../components/Accounts';
import type { Account } from '../types/finance';

interface AccountsPageProps {
  accounts: Account[];
  accountBalances: Record<string, number>;
  selectedAccount: string | null;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  onSelectAccount: (id: string | null) => void;
  onTransferBetweenAccounts: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date?: string;
    description?: string;
  }) => void;
}

export function AccountsPage({
  accounts,
  accountBalances,
  selectedAccount,
  onAddAccount,
  onDeleteAccount,
  onSelectAccount,
  onTransferBetweenAccounts,
}: AccountsPageProps) {
  return (
    <div className="space-y-6">


      <Accounts
        accounts={accounts}
        accountBalances={accountBalances}
        onAddAccount={onAddAccount}
        onDeleteAccount={onDeleteAccount}
        selectedAccount={selectedAccount}
        onSelectAccount={onSelectAccount}
        onTransferBetweenAccounts={onTransferBetweenAccounts}
      />
    </div>
  );
}
