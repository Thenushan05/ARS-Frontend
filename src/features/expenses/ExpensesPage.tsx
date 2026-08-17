import React, { useState, useEffect } from 'react';
import { Plus, Receipt, Upload } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { Expense } from '../../types';
import { expensesApi } from '../../api';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<'Office' | 'Staff' | 'Marketing' | 'Visa Operations' | 'Other'>('Office');
  const [subcategory, setSubcategory] = useState('Printing & Stationery');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState(15000);
  const [date, setDate] = useState('2026-08-16');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Card'>('Bank Transfer');
  const [paidFrom, setPaidFrom] = useState('Commercial Bank - 1000234891');

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expensesApi.getAll();
      setExpenses(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await expensesApi.create({
      category,
      subcategory,
      description,
      supplier,
      amount,
      date,
      paymentMethod,
      paidFrom
    });
    setIsModalOpen(false);
    fetchExpenses();
  };

  const columns: Column<Expense>[] = [
    { key: 'expenseId', header: 'Expense ID', render: (ex) => <span className="font-mono text-rose-400 font-semibold">{ex.expenseId}</span> },
    { key: 'description', header: 'Expense Description', render: (ex) => (
      <div>
        <div className="font-bold text-slate-100">{ex.description}</div>
        <div className="text-xs text-slate-400">{ex.category} — {ex.subcategory}</div>
      </div>
    )},
    { key: 'supplier', header: 'Supplier / Payee', render: (ex) => <span className="text-slate-300 text-xs">{ex.supplier || 'N/A'}</span> },
    { key: 'amount', header: 'Amount Paid', render: (ex) => <CurrencyDisplay amount={ex.amount} className="text-rose-400 font-bold" /> },
    { key: 'paidFrom', header: 'Paid From Account', render: (ex) => <span className="text-xs text-slate-400">{ex.paidFrom}</span> },
    { key: 'date', header: 'Date', render: (ex) => <span className="text-xs text-slate-500">{ex.date}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        subtitle="Log operational overheads, embassy charges, staff commissions, marketing ads, and supplier payments."
        breadcrumbs={[{ label: 'Expenses' }]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        }
      />

      <DataTable columns={columns} data={expenses} isLoading={isLoading} />

      {/* Record Expense Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Office / Operational Expense"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              >
                <option value="Office">Office Overheads</option>
                <option value="Staff">Staff (Salary/Commission)</option>
                <option value="Marketing">Marketing Ads</option>
                <option value="Visa Operations">Visa Operations (VFS/Embassy)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300">Subcategory *</label>
              <input
                type="text"
                required
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300">Expense Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. VFS Embassy appointment charges..."
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Amount Paid (LKR) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 font-bold text-base"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Paid From Account</label>
              <select
                value={paidFrom}
                onChange={(e) => setPaidFrom(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              >
                <option value="Cash in Hand">Cash in Hand</option>
                <option value="Commercial Bank - 1000234891">Commercial Bank - 1000234891</option>
                <option value="Sampath Bank Credit Card">Sampath Bank Credit Card</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg shadow-rose-500/20"
            >
              Log Expense Record
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default ExpensesPage;
