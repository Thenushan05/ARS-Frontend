import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Clock, User, CheckCircle2, Filter, 
  Search, AlertCircle, Phone, FileCheck, Calendar, DollarSign, Building2, Send
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { TaskItem, Customer } from '../../types';
import { tasksApi, customersApi } from '../../api';

type TaskType = 
  | 'Call Customer'
  | 'Collect Documents'
  | 'Check Application'
  | 'Appointment'
  | 'Payment Collection'
  | 'Embassy Follow-up'
  | 'Agent Follow-up'
  | 'General';

type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';

const TASK_TYPES: TaskType[] = [
  'Call Customer',
  'Collect Documents',
  'Check Application',
  'Appointment',
  'Payment Collection',
  'Embassy Follow-up',
  'Agent Follow-up',
  'General'
];

const TASK_STATUSES: TaskStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
  'Overdue'
];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // Create Task Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('Call Customer');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [assignedTo, setAssignedTo] = useState('Saman Jayasinghe');
  const [dueDate, setDueDate] = useState('2026-08-18');
  const [customerName, setCustomerName] = useState('');
  const [caseId, setCaseId] = useState('');

  // Toast notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const [taskData, custRes] = await Promise.all([
        tasksApi.getAll(),
        customersApi.getAll()
      ]);
      setTasks(taskData);
      setCustomers(Array.isArray(custRes) ? custRes : (custRes as any).items || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...tasks];

    if (selectedType !== 'All') {
      result = result.filter(t => t.type === selectedType);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(t => t.status === selectedStatus);
    }

    if (selectedPriority !== 'All') {
      result = result.filter(t => t.priority === selectedPriority);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.caseId && t.caseId.toLowerCase().includes(q)) ||
        t.assignedTo.toLowerCase().includes(q)
      );
    }

    setFilteredTasks(result);
  }, [tasks, selectedType, selectedStatus, selectedPriority, searchTerm]);

  // Toggle Task Status (Allow staff to mark complete / reopen)
  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await tasksApi.toggleStatus(id);
      setNotification(`Task "${updated.title}" status updated to ${updated.status}!`);
      setTimeout(() => setNotification(null), 4000);
      fetchTasks();
    } catch {
      alert('Error updating task status.');
    }
  };

  // Submit New Task Form
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await tasksApi.create({
        title,
        type,
        priority,
        assignedTo,
        dueDate,
        customerName: customerName || undefined,
        caseId: caseId || undefined,
        status: 'Pending'
      });

      setNotification(`New task "${created.title}" created successfully!`);
      setTimeout(() => setNotification(null), 5000);
      setIsCreateModalOpen(false);
      fetchTasks();

      // Reset form
      setTitle('');
      setCustomerName('');
      setCaseId('');
    } catch {
      alert('Error creating task.');
    }
  };

  // KPI Computations
  const totalTasksCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const overdueCount = tasks.filter(t => t.status === 'Overdue').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  const columns: Column<TaskItem>[] = [
    { 
      key: 'title', 
      header: 'Task Title & Client', 
      render: (t) => (
        <div>
          <div className={`font-bold text-xs ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {t.title}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
            {t.customerName && <span className="font-semibold text-slate-700 dark:text-slate-300">Client: {t.customerName}</span>}
            {t.caseId && <span className="font-mono text-purple-600 font-bold text-[10px]">{t.caseId}</span>}
          </div>
        </div>
      ) 
    },
    { 
      key: 'type', 
      header: 'Task Type (8 Categories)', 
      render: (t) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
          {t.type}
        </span>
      ) 
    },
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (t) => (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
          t.priority === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 
          t.priority === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
          'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          {t.priority}
        </span>
      ) 
    },
    { 
      key: 'assignedTo', 
      header: 'Assigned Staff', 
      render: (t) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.assignedTo}</span> 
    },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      render: (t) => <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{t.dueDate}</span> 
    },
    { 
      key: 'status', 
      header: 'Status (5 Options)', 
      render: (t) => {
        if (t.status === 'Completed') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Completed</span>;
        if (t.status === 'In Progress') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">In Progress</span>;
        if (t.status === 'Overdue') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Overdue</span>;
        if (t.status === 'Cancelled') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">Cancelled</span>;
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Pending</span>;
      } 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Tasks & Follow-up Scheduler"
          subtitle="Manage phone calls, VFS document checks, payment collection follow-ups, and embassy tracking action items."
          breadcrumbs={[{ label: 'Tasks' }]}
          actions={
            <PermissionGuard permission="lead.edit">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Task</span>
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

        {/* Top KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tasks Logged" value={totalTasksCount} icon={CheckSquare} colorScheme="blue" subtitle="all task entries" />
          <StatCard title="Pending Action Items" value={pendingCount} icon={Clock} colorScheme="amber" subtitle="requires staff response" />
          <StatCard title="Overdue Follow-ups" value={overdueCount} icon={AlertCircle} colorScheme="rose" subtitle="past due date" />
          <StatCard title="Completed Tasks" value={completedCount} icon={CheckCircle2} colorScheme="emerald" subtitle="successfully resolved" />
        </div>

        {/* Search & 3 Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search tasks, client names, or staff..." 
            className="w-full lg:w-72" 
          />

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
            {/* 1. Task Type Filter (8 Categories) */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-600 dark:text-slate-400">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Types (8)</option>
                {TASK_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 2. Status Filter (5 Statuses) */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses (5)</option>
                {TASK_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 3. Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredTasks}
          isLoading={isLoading}
          emptyText="No matching tasks or follow-ups found."
          actions={(t) => (
            <button
              onClick={() => handleToggleStatus(t.id)}
              className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                t.status === 'Completed'
                  ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-xs'
              }`}
              title={t.status === 'Completed' ? 'Reopen Task' : 'Mark Task Completed'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.status === 'Completed' ? 'Reopen' : 'Mark Complete'}</span>
            </button>
          )}
        />
      </div>

      {/* Create New Task Form Modal */}
      {isCreateModalOpen && (
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Action Task / Follow-up"
          subtitle="Assign tasks to consultants across the 8 standard ARS task categories"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Task Title / Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Call Kavinda Perera regarding France Schengen checklist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task Type (8 Categories) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {TASK_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Staff Member</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Saman Jayasinghe">Saman Jayasinghe</option>
                  <option value="Nimali Fernando">Nimali Fernando</option>
                  <option value="Thenushan Sritharan">Thenushan Sritharan</option>
                  <option value="Kasun Perera">Kasun Perera</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Associated Client (Optional)</label>
                <select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- None / General Task --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.customerId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CAS-9002"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
              >
                Schedule Task
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default TasksPage;
