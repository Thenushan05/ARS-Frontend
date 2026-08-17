import React, { useState, useEffect } from 'react';
import { Landmark, Wallet, CreditCard, ArrowRightLeft, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { BankAccount } from '../../types';
import { bankingApi } from '../../api';

export const BankingPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Transfer Form State
  const [fromAccount, setFromAccount] = useState('Cash in Hand');
  const [toAccount, setToAccount] = useState('Commercial Bank - Operating Account');
  const [amount, setAmount] = useState(50000);
  const [reference, setReference] = useState('REF-TRANS-101');
  const [notes, setNotes] = useState('Daily cash deposit to bank');

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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    await bankingApi.transfer({
      fromAccount,
      toAccount,
      amount,
      reference,
      notes
    });
    setIsTransferModalOpen(false);
    alert(`Success! Internal transfer of LKR ${amount.toLocaleString()} logged.`);
    fetchAccounts();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash & Bank Accounts Management"
        subtitle="Monitor liquidity balances across petty cash, corporate bank accounts, and merchant card gateways."
        breadcrumbs={[{ label: 'Cash & Bank' }]}
        actions={
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Internal Fund Transfer</span>
          </button>
        }
      />

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{acc.type}</p>
                <p className="text-sm font-bold text-slate-100 mt-1">{acc.accountName}</p>
                {acc.accountNumber && <p className="text-[11px] text-slate-500 font-mono">Acct: {acc.accountNumber}</p>}
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {acc.type === 'Cash' ? <Wallet className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[11px] text-slate-500 font-semibold">Available Liquidity</p>
              <CurrencyDisplay amount={acc.currentBalance} className="text-xl text-emerald-400 font-bold" />
            </div>
          </div>
        ))}
      </div>

      {/* Internal Transfer Modal */}
      <FormModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Internal Account Fund Transfer"
        subtitle="Transfer funds between internal company accounts (Non-Expense)"
        maxWidth="md"
      >
        <form onSubmit={handleTransfer} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300">From Account (Source)</label>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            >
              <option value="Cash in Hand">Cash in Hand</option>
              <option value="Commercial Bank - Operating Account">Commercial Bank - Operating Account</option>
              <option value="Sampath Bank - Treasury Account">Sampath Bank - Treasury Account</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300">To Account (Destination)</label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            >
              <option value="Commercial Bank - Operating Account">Commercial Bank - Operating Account</option>
              <option value="Sampath Bank - Treasury Account">Sampath Bank - Treasury Account</option>
              <option value="Cash in Hand">Cash in Hand</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300">Transfer Amount (LKR) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-purple-400 font-bold text-base"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300">Bank Reference / Deposit Slip #</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20"
            >
              Execute Internal Transfer
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default BankingPage;
