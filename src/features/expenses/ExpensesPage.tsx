import React, { useState, useEffect } from 'react';
import { 
  Plus, Receipt, Upload, Search, Filter, Eye, DollarSign, 
  TrendingDown, ArrowDownRight, Building2, User, CreditCard, Calendar, FileText, CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Expense, PaymentMethod, Customer } from '../../types';
import { expensesApi, customersApi } from '../../api';

type ExpenseCategory = 'Office' | 'Staff' | 'Marketing' | 'Visa Operations' | 'Transport';

const CATEGORY_SUBCATEGORIES: Record<ExpenseCategory, string[]> = {
  Office: [
    'Rent',
    'Electricity',
    'Water',
    'Internet',
    'Telephone',
    'Printing',
    'Stationery',
    'Maintenance'
  ],
  Staff: [
    'Salary',
    'Commission',
    'Bonus',
    'Allowance'
  ],
  Marketing: [
    'Facebook Ads',
    'TikTok Ads',
    'Google Ads',
    'Printing/Posters',
    'Promotions'
  ],
  'Visa Operations': [
    'Embassy/VFS Charges',
    'Agent/Supplier Payments',
    'Courier',
    'Translation Cost',
    'Insurance Cost',
    'Booking Cost',
    'Other'
  ],
  Transport: [
    'Fuel',
    'Bank Charges',
    'Legal/Accounting',
    'Miscellaneous'
  ]
};

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  // 13-Field Expense Form State
  const [category, setCategory] = useState<ExpenseCategory>('Office');
  const [subcategory, setSubcategory] = useState<string>('Rent');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('2026-08-18');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [paidFrom, setPaidFrom] = useState('Commercial Bank - 1000234891');
  const [customerName, setCustomerName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [notes, setNotes] = useState('');

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const [expData, custRes] = await Promise.all([
        expensesApi.getAll(),
        customersApi.getAll()
      ]);
      setExpenses(expData);
      setCustomers(Array.isArray(custRes) ? custRes : (custRes as any).items || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Update subcategory when category changes
  useEffect(() => {
    const subs = CATEGORY_SUBCATEGORIES[category];
    if (subs && subs.length > 0) {
      setSubcategory(subs[0]);
    }
  }, [category]);

  // Apply Filter & Search
  useEffect(() => {
    let result = [...expenses];

    if (selectedCategory !== 'All') {
      result = result.filter(ex => ex.category === selectedCategory);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(ex => 
        ex.expenseId.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q) ||
        (ex.supplier && ex.supplier.toLowerCase().includes(q)) ||
        (ex.customerName && ex.customerName.toLowerCase().includes(q)) ||
        (ex.caseId && ex.caseId.toLowerCase().includes(q))
      );
    }

    setFilteredExpenses(result);
  }, [expenses, selectedCategory, searchTerm]);

  // KPI Computations
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newExp = await expensesApi.create({
        expenseId: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
        category,
        subcategory,
        description,
        supplier,
        amount,
        date,
        paymentMethod,
        paidFrom,
        customerName: customerName || undefined,
        caseId: caseId || undefined,
        notes: notes || undefined,
        receiptUrl: receiptFileName ? `/uploads/${receiptFileName}` : undefined
      });

      setNotification(`Expense "${newExp.expenseId}" logged for LKR ${newExp.amount.toLocaleString()}!`);
      setTimeout(() => setNotification(null), 5000);
      setIsModalOpen(false);
      fetchExpenses();

      // Reset form
      setDescription('');
      setSupplier('');
      setAmount(0);
      setCustomerName('');
      setCaseId('');
      setNotes('');
      setReceiptFileName('');
    } catch {
      alert('Error logging expense record.');
    }
  };

  const columns: Column<Expense>[] = [
    { 
      key: 'expenseId', 
      header: 'Expense ID', 
      render: (ex) => <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{ex.expenseId}</span> 
    },
    { 
      key: 'description', 
      header: 'Description & Category', 
      render: (ex) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{ex.description}</div>
          <div className="text-[11px] text-blue-600 dark:text-sky-400 font-semibold">
            {ex.category} — <span className="text-slate-600 dark:text-slate-400">{ex.subcategory}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'supplier', 
      header: 'Supplier / Payee', 
      render: (ex) => <span className="text-slate-800 dark:text-slate-200 text-xs font-medium">{ex.supplier || '—'}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer & Case', 
      render: (ex) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{ex.customerName || '—'}</div>
          {ex.caseId && <div className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-bold">{ex.caseId}</div>}
        </div>
      )
    },
    { 
      key: 'amount', 
      header: 'Amount Paid', 
      render: (ex) => <CurrencyDisplay amount={ex.amount} className="text-rose-600 dark:text-rose-400 font-black text-sm" /> 
    },
    { 
      key: 'paymentMethod', 
      header: 'Method & Account', 
      render: (ex) => (
        <div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            {ex.paymentMethod}
          </span>
          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px] block mt-0.5">{ex.paidFrom}</div>
        </div>
      )
    },
    { 
      key: 'date', 
      header: 'Date', 
      render: (ex) => <span className="text-xs text-slate-500 font-medium">{ex.date}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Expense Management"
          subtitle="Log operational overheads, embassy charges, staff commissions, marketing ads, and supplier payments."
          breadcrumbs={[{ label: 'Expenses' }]}
          actions={
            <PermissionGuard permission="finance.expense.view">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Record New Expense</span>
              </button>
            </PermissionGuard>
          }
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-rose-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Operational Expenses"
            value={totalExpenses}
            isCurrency
            icon={TrendingDown}
            colorScheme="rose"
            subtitle={`${filteredExpenses.length} expense vouchers recorded`}
          />
          <StatCard
            title="Categories Managed"
            value={`${Object.keys(CATEGORY_SUBCATEGORIES).length} Categories`}
            icon={Building2}
            colorScheme="blue"
            subtitle="Office, Staff, Marketing, Visa Ops, Transport"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search by Expense ID, Description, Supplier, or Customer..." 
            className="w-full sm:w-80" 
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories (5)</option>
              <option value="Office">Office Overheads</option>
              <option value="Staff">Staff (Salary / Commission)</option>
              <option value="Marketing">Marketing Ads</option>
              <option value="Visa Operations">Visa Operations (VFS / Embassy)</option>
              <option value="Transport">Transport & Misc</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredExpenses}
          isLoading={isLoading}
          emptyText="No operational expense records logged."
          onRowClick={(ex) => setViewingExpense(ex)}
          actions={(ex) => (
            <button
              onClick={() => setViewingExpense(ex)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1 transition-all"
              title="View Expense Details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          )}
        />
      </div>

      {/* 13-Field Complete Expense Form Modal */}
      {isModalOpen && (
        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record New Expense Voucher"
          subtitle="Complete the 13 expense details to log operational payout"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
            {/* 1 & 2. Category & Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Office">Office</option>
                  <option value="Staff">Staff</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Visa Operations">Visa Operations</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Subcategory <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {CATEGORY_SUBCATEGORIES[category].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3 & 4. Description & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VFS Embassy appointment fee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. Supplier / Payee
                </label>
                <input
                  type="text"
                  placeholder="e.g. VFS Global / Meta Ads"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 5 & 6. Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  5. Amount Paid (LKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 15000"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-rose-600 dark:text-rose-400 font-mono font-black text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  6. Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 7 & 8. Payment Method & Paid From */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  7. Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  8. Paid From (Account)
                </label>
                <select
                  value={paidFrom}
                  onChange={(e) => setPaidFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Commercial Bank - 1000234891">Commercial Bank - 1000234891</option>
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Sampath Bank Credit Card">Sampath Bank Credit Card</option>
                  <option value="Petty Cash Fund">Petty Cash Fund</option>
                </select>
              </div>
            </div>

            {/* 9 & 10. Customer & Case */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  9. Associated Customer (Optional)
                </label>
                <select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- None / General Expense --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.customerId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  10. Case Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CAS-9002"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* 11. Receipt Upload */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                11. Receipt Upload / Proof Attachment
              </label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800">
                <Upload className="w-4 h-4 text-slate-400" />
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFileName(e.target.files[0].name);
                    }
                  }}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* 12. Notes */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                12. Notes / Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md"
              >
                Log Expense Voucher
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* View Expense Detail Modal */}
      {viewingExpense && (
        <FormModal
          isOpen={!!viewingExpense}
          onClose={() => setViewingExpense(null)}
          title={`Expense Transaction Voucher — ${viewingExpense.expenseId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Expense ID:</span> <span className="font-mono font-bold text-rose-600">{viewingExpense.expenseId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Category & Sub:</span> <span className="font-bold text-blue-600">{viewingExpense.category} — {viewingExpense.subcategory}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Description:</span> <span className="font-bold text-slate-900">{viewingExpense.description}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Supplier / Payee:</span> <span className="font-semibold text-slate-800">{viewingExpense.supplier || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{viewingExpense.date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span> <span className="font-semibold text-slate-800">{viewingExpense.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid From Account:</span> <span className="font-mono text-slate-700">{viewingExpense.paidFrom}</span></div>
              {viewingExpense.customerName && <div className="flex justify-between"><span className="text-slate-500">Associated Customer:</span> <span className="font-bold text-slate-900">{viewingExpense.customerName}</span></div>}
              {viewingExpense.caseId && <div className="flex justify-between"><span className="text-slate-500">Case Reference:</span> <span className="font-mono font-bold text-purple-600">{viewingExpense.caseId}</span></div>}
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-xs text-rose-800 font-bold uppercase block">Total Amount Paid</span>
              <span className="text-2xl font-black font-mono text-rose-600">LKR {viewingExpense.amount.toLocaleString()}</span>
            </div>

            {viewingExpense.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">Notes:</span>
                <p className="text-slate-700 italic">{viewingExpense.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default ExpensesPage;
