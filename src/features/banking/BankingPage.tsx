import React, { useState, useEffect } from 'react';
import { 
  Landmark, Wallet, CreditCard, ArrowRightLeft, Plus, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText, Calendar, Building2, ShieldCheck
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { BankAccount, AccountTransfer } from '../../types';
import { bankingApi, incomeApi, expensesApi, paymentsApi } from '../../api';

interface AccountTxn {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
}

export const BankingPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Transfer Form State (Clearly Labeled as Internal Transfer)
  const [fromAccount, setFromAccount] = useState('Cash in Hand');
  const [toAccount, setToAccount] = useState('Commercial Bank - Operating Account');
  const [amount, setAmount] = useState<number>(50000);
  const [date, setDate] = useState('2026-08-18');
  const [reference, setReference] = useState('REF-TRF-8102');
  const [notes, setNotes] = useState('Daily petty cash deposit to Commercial Bank main operating account');

  // Toast notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await bankingApi.getAccounts();
      setAccounts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle Internal Transfer Submission
  const handleInternalTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccount === toAccount) {
      alert('Source (From Account) and Destination (To Account) cannot be the same!');
      return;
    }

    try {
      const trf = await bankingApi.transfer({
        fromAccount,
        toAccount,
        amount,
        date,
        reference,
        notes
      });

      setNotification(`Internal Transfer of LKR ${amount.toLocaleString()} executed from "${fromAccount}" to "${toAccount}"! Ref: ${trf.reference}`);
      setTimeout(() => setNotification(null), 5000);
      setIsTransferModalOpen(false);
      fetchAccounts();
    } catch {
      alert('Error executing internal transfer.');
    }
  };

  // Mock Recent Transactions List per Account
  const getRecentTxns = (accountName: string): AccountTxn[] => {
    if (accountName.includes('Cash')) {
      return [
        { id: 'txn-1', date: '2026-08-18', description: 'Client Receipt - Kamal Gunaratne', amount: 185000, type: 'Credit' },
        { id: 'txn-2', date: '2026-08-16', description: 'Petty Cash Stationery Expense', amount: 8500, type: 'Debit' },
        { id: 'txn-3', date: '2026-08-14', description: 'Office Cleaning Refreshments', amount: 3500, type: 'Debit' }
      ];
    }
    if (accountName.includes('Commercial')) {
      return [
        { id: 'txn-4', date: '2026-08-17', description: 'Client Bank Deposit - Sanduni De Silva', amount: 70000, type: 'Credit' },
        { id: 'txn-5', date: '2026-08-15', description: 'Monthly Head Office Rent Payout', amount: 120000, type: 'Debit' },
        { id: 'txn-6', date: '2026-08-12', description: 'CEB Electricity Bill Transfer', amount: 28500, type: 'Debit' }
      ];
    }
    if (accountName.includes('Sampath')) {
      return [
        { id: 'txn-7', date: '2026-08-15', description: 'Treasury Transfer Deposit', amount: 500000, type: 'Credit' },
        { id: 'txn-8', date: '2026-08-10', description: 'Meta Facebook Ads Settlement', amount: 45000, type: 'Debit' },
        { id: 'txn-9', date: '2026-08-05', description: 'Fixed Deposit Yield', amount: 85000, type: 'Credit' }
      ];
    }
    return [
      { id: 'txn-10', date: '2026-08-18', description: 'Online Gateway Settlement (Card)', amount: 65000, type: 'Credit' },
      { id: 'txn-11', date: '2026-08-14', description: 'Merchant Processing Commission Fee', amount: 2100, type: 'Debit' },
      { id: 'txn-12', date: '2026-08-11', description: 'Online Booking Payment Collection', amount: 48000, type: 'Credit' }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Cash & Bank Accounts Management"
          subtitle="Monitor account balances, view recent transactions, and execute internal non-expense fund transfers."
          breadcrumbs={[{ label: 'Cash & Bank' }]}
          actions={
            <PermissionGuard permission="finance.banking.view">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4 stroke-[3]" />
                <span>Execute Internal Transfer</span>
              </button>
            </PermissionGuard>
          }
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-purple-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* 4 Account Cards Grid (Cash in Hand, Bank Account 1, Bank Account 2, Card/Online Payments) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {accounts.map((acc) => {
            const recentTxns = getRecentTxns(acc.accountName);
            const isCash = acc.type === 'Cash';
            const isOnline = acc.type === 'Card/Online';

            return (
              <div 
                key={acc.id} 
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between h-full min-h-[400px] hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start min-h-[60px]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                        {acc.type === 'Cash' ? 'Petty Cash Vault' : acc.type === 'Card/Online' ? 'Merchant Gateway' : 'Bank Account'}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
                        {acc.accountName}
                      </h3>
                      {acc.accountNumber ? (
                        <p className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                          Acct #: {acc.accountNumber}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium">Direct Vault</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      isCash 
                        ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:border-amber-800'
                        : isOnline 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/60 dark:border-blue-800'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800'
                    }`}>
                      {isCash ? <Wallet className="w-5 h-5" /> : isOnline ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Current Balance */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">CURRENT BALANCE</span>
                    <CurrencyDisplay amount={acc.currentBalance} className="text-2xl text-emerald-600 dark:text-emerald-400 font-black font-mono" />
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span>Recent Transactions</span>
                    <span className="text-[10px] font-semibold text-slate-500">Last 3</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {recentTxns.map((txn) => (
                      <div key={txn.id} className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] gap-2 overflow-hidden">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={txn.description}>{txn.description}</p>
                          <p className="text-[10px] text-slate-500">{txn.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-mono font-bold text-[11px] whitespace-nowrap px-1.5 py-0.5 rounded ${
                            txn.type === 'Credit' 
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800' 
                              : 'text-rose-700 bg-rose-50 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                          }`}>
                            {txn.type === 'Credit' ? '+' : '-'} {txn.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Internal Transfer UI Modal (Clearly Labeled as Internal Transfer) */}
      {isTransferModalOpen && (
        <FormModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title="INTERNAL ACCOUNT FUND TRANSFER"
          subtitle="Execute non-expense internal fund movements between corporate bank & cash accounts"
          maxWidth="lg"
        >
          <form onSubmit={handleInternalTransferSubmit} className="space-y-4 text-xs">
            {/* Clear Internal Transfer Badge */}
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center gap-2 text-purple-900 dark:text-purple-100 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>CLEARLY LABELED INTERNAL TRANSFER: Does not affect P&L operational expense totals.</span>
            </div>

            {/* From Account & To Account */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  From Account (Source) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.accountName}>
                      {a.accountName} (Bal: LKR {a.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  To Account (Destination) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.accountName}>
                      {a.accountName} (Bal: LKR {a.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Amount (LKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 50000"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-purple-700 dark:text-purple-400 font-mono font-black text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reference / Deposit Slip #
              </label>
              <input
                type="text"
                placeholder="e.g. REF-TRF-8102 (Commercial Bank Deposit Slip)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transfer Notes & Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Purpose of internal transfer..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold shadow-md"
              >
                Execute Internal Transfer
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default BankingPage;
