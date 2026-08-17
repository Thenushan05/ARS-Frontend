import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, User, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { TaskItem } from '../../types';
import { tasksApi } from '../../api';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleStatus = async (id: string) => {
    await tasksApi.toggleStatus(id);
    fetchTasks();
  };

  const columns: Column<TaskItem>[] = [
    { key: 'title', header: 'Task & Details', render: (t) => (
      <div>
        <div className={`font-bold text-xs ${t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
          {t.title}
        </div>
        <div className="text-[11px] text-slate-400">Type: {t.type} | Client: {t.customerName || 'N/A'}</div>
      </div>
    )},
    { key: 'priority', header: 'Priority', render: (t) => (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
        t.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
      }`}>
        {t.priority}
      </span>
    )},
    { key: 'assignedTo', header: 'Assigned Staff', render: (t) => <span className="text-xs text-slate-300">{t.assignedTo}</span> },
    { key: 'dueDate', header: 'Due Date', render: (t) => <span className="text-xs text-amber-400 font-semibold">{t.dueDate}</span> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Follow-up Scheduler"
        subtitle="Manage daily phone follow-ups, VFS document checks, payment collections, and consultant action items."
        breadcrumbs={[{ label: 'Tasks & Follow-ups' }]}
        actions={
          <button
            onClick={() => alert('New task form')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        actions={(t) => (
          <button
            onClick={() => handleToggleStatus(t.id)}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              t.status === 'Completed'
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.status === 'Completed' ? 'Reopen' : 'Mark Done'}</span>
          </button>
        )}
      />
    </div>
  );
};

export default TasksPage;
