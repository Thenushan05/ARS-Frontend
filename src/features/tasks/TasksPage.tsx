import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckSquare, Plus, Clock, CheckCircle2, Filter, AlertCircle, Lock, Pencil, XCircle,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import SearchInput from '../../components/common/SearchInput';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { useStaffOptions } from '../../hooks/useStaffOptions';
import { customersApi } from '../../api/customersApi';
import { queryKeys } from '../../api/queryKeys';
import { normalizeApiError } from '../../api/errors';
import { TASK_TYPE, TASK_PRIORITY, TASK_STATUS, humanizeEnum } from '../../utils/enumLabels';
import { ApiTask, ApiTaskType, ApiTaskPriority, ApiTaskStatus, CreateTaskInput } from '../../types/api';
import { useTasks, useCreateTask, useUpdateTask, useCompleteTask, useCancelTask } from './hooks/useTasksQueries';

const PAGE_SIZE = 10;

// Priority uses its own small color map, keyed on the REAL ApiTaskPriority enum values
// (LOW/MEDIUM/HIGH/URGENT) — StatusBadge's keyword-based color matching has no entries for any
// of these, so every priority would render as its flat grey fallback there.
const PRIORITY_STYLES: Record<ApiTaskPriority, string> = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  MEDIUM: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  HIGH: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  URGENT: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

const TERMINAL_STATUSES: ApiTaskStatus[] = ['COMPLETED', 'CANCELLED'];

interface TaskFormState {
  title: string;
  type: ApiTaskType;
  priority: ApiTaskPriority;
  assignedToId: string;
  dueDate: string;
  customerId: string;
  caseId: string;
}

const emptyForm: TaskFormState = {
  title: '',
  type: 'CALL_CUSTOMER',
  priority: 'MEDIUM',
  assignedToId: '',
  dueDate: '',
  customerId: '',
  caseId: '',
};

function toFormState(task: ApiTask): TaskFormState {
  return {
    title: task.title,
    type: task.type,
    priority: task.priority,
    assignedToId: task.assignedToId ?? '',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    customerId: task.customerId ?? '',
    caseId: task.caseId ?? '',
  };
}

export const TasksPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canView = hasPermission('task.view');
  const canManage = hasPermission('task.manage');

  // Server-side filters — these three ARE real, implemented backend query params (unlike `search`).
  const [typeFilter, setTypeFilter] = useState<ApiTaskType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ApiTaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<ApiTaskPriority | ''>('');
  const [page, setPage] = useState(1);

  // Client-side only — `search` is accepted by the backend's TaskQueryDto but silently ignored
  // server-side (no text-search branch in TasksService.findAll), so this only filters the
  // currently-fetched page in memory rather than being sent as a query param.
  const [searchTerm, setSearchTerm] = useState('');

  const listFilters = {
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const tasksQuery = useTasks(listFilters, { enabled: canView });

  // KPI counts — each a cheap `limit: 1` request read only for its `pagination.total`, independent
  // of the table's own type/status/priority filters (a KPI card should reflect the whole board, not
  // whatever the user currently has the table filtered down to). There's no dedicated stats
  // endpoint, so this reuses the same list endpoint per status bucket rather than fetching every
  // task unpaginated (which the old mock-era page did, and which no longer scales server-side).
  const totalCountQuery = useTasks({ limit: 1 }, { enabled: canView });
  const pendingCountQuery = useTasks({ limit: 1, status: 'PENDING' }, { enabled: canView });
  const inProgressCountQuery = useTasks({ limit: 1, status: 'IN_PROGRESS' }, { enabled: canView });
  const overdueCountQuery = useTasks({ limit: 1, status: 'OVERDUE' }, { enabled: canView });
  const completedCountQuery = useTasks({ limit: 1, status: 'COMPLETED' }, { enabled: canView });

  const totalTasksCount = totalCountQuery.data?.pagination.total ?? 0;
  const pendingCount = (pendingCountQuery.data?.pagination.total ?? 0) + (inProgressCountQuery.data?.pagination.total ?? 0);
  const overdueCount = overdueCountQuery.data?.pagination.total ?? 0;
  const completedCount = completedCountQuery.data?.pagination.total ?? 0;

  const { options: staffOptions } = useStaffOptions();

  // Lookup-list shim for the "associated customer" picker, same shape as useStaffOptions — only
  // fetched for a caller who could actually see the result, and shares its cache entry with the
  // Customers module's own `queryKeys.customers.list` key.
  const canViewCustomers = hasPermission('customer.view');
  const customersQuery = useQuery({
    queryKey: queryKeys.customers.list({ limit: 100 }),
    queryFn: () => customersApi.getAll({ limit: 100 }),
    enabled: canViewCustomers,
    staleTime: 5 * 60 * 1000,
  });
  const customerOptions = customersQuery.data?.data ?? [];

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const cancelTask = useCancelTask();

  // Create / Edit modal (one shared modal, mirroring the Leads module's isAddEditModalOpen /
  // editingLead convention) — editingTask null means "create new".
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null);
  const [formState, setFormState] = useState<TaskFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormState(emptyForm);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (task: ApiTask) => {
    setEditingTask(task);
    setFormState(toFormState(task));
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingTask(null);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const input: CreateTaskInput = {
      title: formState.title.trim(),
      type: formState.type,
      priority: formState.priority,
      assignedToId: formState.assignedToId || undefined,
      dueDate: formState.dueDate || undefined,
      customerId: formState.customerId || undefined,
      caseId: formState.caseId.trim() || undefined,
    };

    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, input },
        {
          onSuccess: (updated) => {
            notify(`Task "${updated.title}" updated successfully.`);
            closeFormModal();
          },
          onError: (err) => setFormError(normalizeApiError(err).message),
        },
      );
    } else {
      createTask.mutate(input, {
        onSuccess: (created) => {
          notify(`Task "${created.title}" created successfully.`);
          closeFormModal();
        },
        onError: (err) => setFormError(normalizeApiError(err).message),
      });
    }
  };

  const handleComplete = (task: ApiTask) => {
    completeTask.mutate(task.id, {
      onSuccess: () => notify(`Task "${task.title}" marked completed.`),
      onError: (err) => notify(normalizeApiError(err).message, 'error'),
    });
  };

  const handleCancel = (task: ApiTask) => {
    cancelTask.mutate(task.id, {
      onSuccess: () => notify(`Task "${task.title}" cancelled.`),
      onError: (err) => notify(normalizeApiError(err).message, 'error'),
    });
  };

  const allTasks = tasksQuery.data?.data ?? [];
  const filteredTasks = searchTerm
    ? allTasks.filter((t) => {
        const q = searchTerm.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.customer?.fullName.toLowerCase().includes(q) ?? false) ||
          (t.customer?.customerCode.toLowerCase().includes(q) ?? false) ||
          (t.assignedTo?.fullName.toLowerCase().includes(q) ?? false) ||
          (t.caseId?.toLowerCase().includes(q) ?? false)
        );
      })
    : allTasks;

  const columns: Column<ApiTask>[] = [
    {
      key: 'title',
      header: 'Task Title & Client',
      render: (t) => (
        <div>
          <div className={`font-bold text-xs ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {t.title}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
            {t.customer && <span className="font-semibold text-slate-700 dark:text-slate-300">Client: {t.customer.fullName}</span>}
            {t.caseId && (
              <span className="font-mono text-purple-600 font-bold text-[10px]" title={t.caseId}>
                {t.caseId.slice(0, 8)}…
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Task Type',
      render: (t) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
          {TASK_TYPE.labels[t.type] ?? humanizeEnum(t.type)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${PRIORITY_STYLES[t.priority]}`}>
          {TASK_PRIORITY.labels[t.priority] ?? humanizeEnum(t.priority)}
        </span>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assigned Staff',
      render: (t) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {t.assignedTo?.fullName ?? <span className="text-slate-400 font-normal italic">Unassigned</span>}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (t) => (
        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
          {t.dueDate ? t.dueDate.slice(0, 10) : '—'}
          {t.dueTime ? ` ${t.dueTime}` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
  ];

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tasks & Follow-up Scheduler"
          subtitle="Manage phone calls, VFS document checks, payment collection follow-ups, and embassy tracking action items."
          breadcrumbs={[{ label: 'Tasks' }]}
        />
        <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm">Access Restricted</h4>
          <p className="text-amber-800 dark:text-amber-200 text-xs">
            You do not have the required permission (<code className="font-mono text-purple-700">task.view</code>) to view tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Tasks & Follow-up Scheduler"
          subtitle="Manage phone calls, VFS document checks, payment collection follow-ups, and embassy tracking action items."
          breadcrumbs={[{ label: 'Tasks' }]}
          actions={
            <PermissionGuard permission="task.manage">
              <button
                onClick={openCreateModal}
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
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {tasksQuery.isError && (
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-sm font-medium">
            {normalizeApiError(tasksQuery.error).message}
          </div>
        )}

        {/* Top KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tasks Logged" value={totalTasksCount} icon={CheckSquare} colorScheme="blue" subtitle="all task entries" />
          <StatCard title="Pending Action Items" value={pendingCount} icon={Clock} colorScheme="amber" subtitle="requires staff response" />
          <StatCard title="Overdue Follow-ups" value={overdueCount} icon={AlertCircle} colorScheme="rose" subtitle="past due date" />
          <StatCard title="Completed Tasks" value={completedCount} icon={CheckCircle2} colorScheme="emerald" subtitle="successfully resolved" />
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search within this page (title, client, staff)..."
            className="w-full lg:w-72"
          />

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-600 dark:text-slate-400">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as ApiTaskType | ''); setPage(1); }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                {TASK_TYPE.values.map((t) => (
                  <option key={t} value={t}>{TASK_TYPE.labels[t]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as ApiTaskStatus | ''); setPage(1); }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {TASK_STATUS.values.map((s) => (
                  <option key={s} value={s}>{TASK_STATUS.labels[s]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value as ApiTaskPriority | ''); setPage(1); }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                {TASK_PRIORITY.values.map((p) => (
                  <option key={p} value={p}>{TASK_PRIORITY.labels[p]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredTasks}
          isLoading={tasksQuery.isLoading}
          emptyText="No matching tasks or follow-ups found."
          page={page}
          totalPages={tasksQuery.data?.pagination.pages ?? 1}
          totalRecords={tasksQuery.data?.pagination.total}
          onPageChange={setPage}
          actions={
            canManage
              ? (t) => {
                  const isTerminal = TERMINAL_STATUSES.includes(t.status);
                  return (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Edit Task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!isTerminal && (
                        <>
                          <button
                            onClick={() => handleComplete(t)}
                            disabled={completeTask.isPending}
                            className="px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-xs disabled:opacity-50"
                            title="Mark Task Completed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => handleCancel(t)}
                            disabled={cancelTask.isPending}
                            className="px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                            title="Cancel Task"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  );
                }
              : undefined
          }
        />
      </div>

      {/* Create / Edit Task Form Modal */}
      {isFormModalOpen && (
        <FormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          title={editingTask ? 'Edit Task / Follow-up' : 'Create New Action Task / Follow-up'}
          subtitle="Assign tasks to consultants across the standard ARS task categories"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold">
                {formError}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Task Title / Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Call Kavinda Perera regarding France Schengen checklist"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Task Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formState.type}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value as ApiTaskType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {TASK_TYPE.values.map((t) => (
                    <option key={t} value={t}>{TASK_TYPE.labels[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={formState.priority}
                  onChange={(e) => setFormState({ ...formState, priority: e.target.value as ApiTaskPriority })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {TASK_PRIORITY.values.map((p) => (
                    <option key={p} value={p}>{TASK_PRIORITY.labels[p]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Staff Member</label>
                {hasPermission('staff.view') ? (
                  <select
                    value={formState.assignedToId}
                    onChange={(e) => setFormState({ ...formState, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {staffOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value="No permission to view staff"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-400 italic"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formState.dueDate}
                  onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Associated Client (Optional)</label>
                {canViewCustomers ? (
                  <select
                    value={formState.customerId}
                    onChange={(e) => setFormState({ ...formState, customerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- None / General Task --</option>
                    {customerOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.customerCode})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value="No permission to view customers"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-400 italic"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste the case's UUID"
                  value={formState.caseId}
                  onChange={(e) => setFormState({ ...formState, caseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTask.isPending || updateTask.isPending}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md disabled:opacity-50"
              >
                {editingTask ? 'Save Changes' : 'Schedule Task'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default TasksPage;
