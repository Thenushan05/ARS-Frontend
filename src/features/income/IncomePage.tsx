import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Plus, Search, Filter, Eye, Building2, 
  CreditCard, Calendar, CheckCircle2, ArrowUpRight, Award, FileText
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { Income, PaymentMethod } from '../../types';
import { incomeApi } from '../../api';

type IncomeCategory = 
  | 'Visa Service Income'
  | 'e-Visa Income'
  | 'Student Service Income'
  | 'Work Visa Service Income'
  | 'Tourist Visa Income'
  | 'Consultation'
  | 'Document Service'
  | 'Translation'
  | 'Insurance Commission'
  | 'Air Ticket Commission'
  | 'Agent Commission'
  | 'Other Income';

const CATEGORIES: IncomeCategory[] = [
  'Visa Service Income',
  'e-Visa Income',
  'Student Service Income',
  'Work Visa Service Income',
  'Tourist Visa Income',
  'Consultation',
  'Document Service',
  'Translation',
  'Insurance Commission',
  'Air Ticket Commission',
  'Agent Commission',
  'Other Income'
];

export const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    customerName: string;
    caseId: string;
    category: IncomeCategory;
    amount: number;
    paymentMethod: PaymentMethod;
    account: string;
    source: string;
    date: string;
  }>({
    customerName: '',
    caseId: 'CAS-9002',
    category: 'Tourist Visa Income',
    amount: 0,
    paymentMethod: 'Bank Transfer',
    account: 'Commercial Bank Main Acc #1000234891',
    source: 'Invoice Payment',
    date: '2026-08-18'
  });

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const fetchIncome = async () => {
    setIsLoading(true);
    try {
      const data = await incomeApi.getAll();
      setIncomes(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...incomes];

    if (selectedCategory !== 'All') {
      result = result.filter(inc => inc.category === selectedCategory);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(inc => 
        inc.transactionId.toLowerCase().includes(q) ||
        inc.customerName.toLowerCase().includes(q) ||
        (inc.caseId && inc.caseId.toLowerCase().includes(q)) ||
        inc.source.toLowerCase().includes(q)
      );
    }

    setFilteredIncomes(result);
  }, [incomes, selectedCategory, searchTerm]);

  // Total Income KPI Calculation
  const totalIncome = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Determine top category
  const categoryTotals: Record<string, number> = {};
  incomes.forEach(inc => {
    categoryTotals[inc.category] = (categoryTotals[inc.category] || 0) + inc.amount;
  });
  const topCategoryName = Object.keys(categoryTotals).reduce((a, b) => 
    (categoryTotals[a] || 0) > (categoryTotals[b] || 0) ? a : b, 'Tourist Visa Income'
  );

  // Handle Form Submission
  const handleSubmitNewIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newInc = await incomeApi.create({
        ...formData,
        transactionId: `INC-2026-${Math.floor(800 + Math.random() * 200)}`
      });

      setNotification(`Successfully recorded income entry "${newInc.transactionId}" for LKR ${newInc.amount.toLocaleString()}!`);
      setTimeout(() => setNotification(null), 5000);
      setIsRecordModalOpen(false);
      fetchIncome();
      setFormData({
        customerName: '',
        caseId: 'CAS-9002',
        category: 'Tourist Visa Income',
        amount: 0,
        paymentMethod: 'Bank Transfer',
        account: 'Commercial Bank Main Acc #1000234891',
        source: 'Invoice Payment',
        date: '2026-08-18'
      });
    } catch {
      alert('Error recording income transaction.');
    }
  };

  // 9 Required Columns
  const columns: Column<Income>[] = [
    { 
      key: 'transactionId', 
      header: 'Transaction ID', 
      render: (inc) => (
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{inc.transactionId}</span>
      ) 
    },
    { 
      key: 'date', 
      header: 'Date', 
      render: (inc) => <span className="text-xs text-slate-500 font-medium">{inc.date}</span> 
    },
    { 
      key: 'customerName', 
      header: 'Customer', 
      render: (inc) => <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{inc.customerName}</span> 
    },
    { 
      key: 'caseId', 
      header: 'Case', 
      render: (inc) => (
        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
          {inc.caseId || 'Direct'}
        </span>
      ) 
    },
    { 
      key: 'category', 
      header: 'Category', 
      render: (inc) => (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
          {inc.category}
        </span>
      ) 
    },
    { 
      key: 'amount', 
      header: 'Amount', 
      render: (inc) => <CurrencyDisplay amount={inc.amount} className="text-emerald-600 dark:text-emerald-400 font-black text-sm" /> 
    },
    { 
      key: 'paymentMethod', 
      header: 'Payment Method', 
      render: (inc) => (
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold">
          {inc.paymentMethod}
        </span>
      ) 
    },
    { 
      key: 'account', 
      header: 'Account', 
      render: (inc) => <span className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate max-w-[140px] block">{inc.account}</span> 
    },
    { 
      key: 'source', 
      header: 'Source', 
      render: (inc) => <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{inc.source}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Income Management"
          subtitle="Track revenue streams across 12 income categories including Visa Services, e-Visa, Commissions, and Consultations."
          breadcrumbs={[{ label: 'Income' }]}
          actions={
            <PermissionGuard permission="finance.income.view">
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Record New Income</span>
              </button>
            </PermissionGuard>
          }
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Revenue Collected"
            value={totalIncome}
            isCurrency
            icon={TrendingUp}
            colorScheme="emerald"
            subtitle={`${filteredIncomes.length} revenue transactions recorded`}
          />
          <StatCard
            title="Top Revenue Category"
            value={topCategoryName}
            icon={Award}
            colorScheme="blue"
            subtitle={`Highest performing service line item`}
          />
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search by Transaction ID, Customer, or Case..." 
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
              <option value="All">All Categories (12)</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredIncomes}
          isLoading={isLoading}
          emptyText="No income transactions recorded."
          onRowClick={(inc) => setViewingIncome(inc)}
          actions={(inc) => (
            <button
              onClick={() => setViewingIncome(inc)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
              title="View Income Entry"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          )}
        />
      </div>

      {/* Record New Income Form Modal */}
      {isRecordModalOpen && (
        <FormModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title="Record New Income Entry"
          subtitle="Log revenue received across any of the 12 ARS income categories"
          maxWidth="xl"
        >
          <form onSubmit={handleSubmitNewIncome} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanduni De Silva"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. CAS-9002 or Direct"
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Income Category (12 Options) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeCategory })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received (LKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 65000"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deposited Account</label>
                <input
                  type="text"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  placeholder="e.g. Commercial Bank Main Acc #1000234891"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Revenue Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g. Invoice Payment / Partner Referral"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
              >
                Save Income Transaction
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* View Income Detail Modal */}
      {viewingIncome && (
        <FormModal
          isOpen={!!viewingIncome}
          onClose={() => setViewingIncome(null)}
          title={`Income Transaction Details — ${viewingIncome.transactionId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Transaction ID:</span> <span className="font-mono font-bold text-emerald-600">{viewingIncome.transactionId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{viewingIncome.date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer:</span> <span className="font-bold text-slate-900">{viewingIncome.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Case Ref:</span> <span className="font-mono font-bold text-purple-600">{viewingIncome.caseId || 'Direct'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Income Category:</span> <span className="font-bold text-blue-600">{viewingIncome.category}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span> <span className="font-semibold text-slate-800">{viewingIncome.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Deposited Account:</span> <span className="font-mono text-slate-700">{viewingIncome.account}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Revenue Source:</span> <span className="font-semibold text-slate-800">{viewingIncome.source}</span></div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs text-emerald-800 font-bold uppercase block">Total Income Collected</span>
              <span className="text-2xl font-black font-mono text-emerald-600">LKR {viewingIncome.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingIncome(null)}
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

export default IncomePage;
