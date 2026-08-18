import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, Clock, Calendar, ArrowRight, User, Phone, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskItem } from '../../types';
import { tasksApi } from '../../api';

export const TodaysTasksWidget: React.FC = () => {
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

  const handleToggle = async (id: string) => {
    await tasksApi.toggleStatus(id);
    fetchTasks();
  };

  const pendingCount = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Today's Tasks & Follow-ups</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                {pendingCount} Pending
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Action items assigned for client cases</p>
          </div>
        </div>

        <Link
          to="/tasks"
          className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-sky-400 flex items-center gap-1 hover:underline"
        >
          <span>View All Tasks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Task Item List */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 font-medium">No tasks scheduled for today.</div>
      ) : (
        <div className="space-y-2.5">
          {tasks.slice(0, 5).map((task) => {
            const isDone = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Checkbox Toggle */}
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent'
                    }`}
                    title={isDone ? 'Mark as Pending' : 'Mark Task Completed'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current stroke-white" />
                  </button>

                  <div className="space-y-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {/* Type Badge */}
                      <span className="px-2 py-0.5 rounded font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {task.type}
                      </span>

                      {/* Customer */}
                      {task.customerName && (
                        <span className="text-slate-500 font-semibold truncate max-w-[120px]">
                          Client: {task.customerName}
                        </span>
                      )}

                      {/* Priority */}
                      <span className={`px-1.5 py-0.2 font-bold rounded ${
                        task.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date & Action */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-500 block">{task.dueDate}</span>
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline mt-1 block"
                  >
                    {isDone ? 'Reopen' : 'Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysTasksWidget;
