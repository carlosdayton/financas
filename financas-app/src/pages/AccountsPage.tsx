import { Accounts } from '../components/Accounts';
import type { Account } from '../types/finance';

interface AccountsPageProps {
  accounts: Account[];
  accountBalances: Record<string, number>;
  selectedAccount: string | null;
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  onSelectAccount: (id: string | null) => void;
}

export function AccountsPage({
  accounts,
  accountBalances,
  selectedAccount,
  onAddAccount,
  onDeleteAccount,
  onSelectAccount,
}: AccountsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Contas</h2>
        <p className="text-[#a0a0b8]">Gerencie suas contas e carteiras</p>
      </div>

      <Accounts
        accounts={accounts}
        accountBalances={accountBalances}
        onAddAccount={onAddAccount}
        onDeleteAccount={onDeleteAccount}
        selectedAccount={selectedAccount}
        onSelectAccount={onSelectAccount}
      />
    </div>
  );
}
