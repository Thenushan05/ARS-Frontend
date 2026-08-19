import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Filter, Eye, Grid3x3, List, MapPin, Clock, CheckCircle2, XCircle, UserX, Edit3,
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import type { EventClickInfo, DatesSetInfo, EventInput } from '@fullcalendar/react';

import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { useStaffOptions } from '../../hooks/useStaffOptions';
import { customersApi } from '../../api/customersApi';
import { normalizeApiError } from '../../api/errors';
import { APPOINTMENT_TYPE, APPOINTMENT_STATUS, humanizeEnum } from '../../utils/enumLabels';
import {
  ApiAppointment, ApiAppointmentType, ApiAppointmentStatus, CreateAppointmentInput,
} from '../../types/api';
import {
  useAppointments, useCreateAppointment, useUpdateAppointment,
  useCompleteAppointment, useCancelAppointment, useNoShowAppointment,
} from './hooks/useAppointmentsQueries';

/**
 * Appointments (Phase 2). Replaces the mock-era page: real `appointmentsApi`/`customersApi`,
 * real `ApiAppointmentType`/`ApiAppointmentStatus` values, a genuinely working list view with
 * server pagination, and a real `<FullCalendar>` month/week/day calendar (no more hand-rolled
 * grid hardcoded to August 2026) — see INTEGRATION_PLAN.md.
 *
 * FullCalendar version note: `@fullcalendar/react` is on major v7 (a rewrite on its own
 * `@full-ui/headless-calendar` core), while the separately-installed `@fullcalendar/daygrid`,
 * `@fullcalendar/interaction`, `@fullcalendar/timegrid` are on v6 and target the OLD
 * `@fullcalendar/core` — their `PluginDef` type is NOT the `PluginInput` v7's `<Calendar>`
 * component expects, so passing them directly in `plugins` does not compile. `@fullcalendar/react`
 * v7 bundles its OWN version-matched reimplementations of exactly these three plugins as subpath
 * exports (`@fullcalendar/react/daygrid` etc.) with the same classic API surface (view names like
 * `dayGridMonth`, `headerToolbar`, `eventClick`, `datesSet`, ...) — importing from there instead
 * gives a real, fully-typechecked, working calendar without needing the mismatched v6 packages.
 */

type DisplayMode = 'table' | 'calendar';

const TYPE_STYLES: Record<ApiAppointmentType, { badge: string; chip: string }> = {
  OFFICE: {
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    chip: 'bg-slate-500 border-slate-600 text-white',
  },
  ONLINE_CONSULTATION: {
    badge: 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    chip: 'bg-sky-500 border-sky-600 text-white',
  },
  VFS: {
    badge: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    chip: 'bg-blue-500 border-blue-600 text-white',
  },
  EMBASSY: {
    badge: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    chip: 'bg-purple-500 border-purple-600 text-white',
  },
  BIOMETRICS: {
    badge: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    chip: 'bg-emerald-500 border-emerald-600 text-white',
  },
  MEDICAL: {
    badge: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    chip: 'bg-rose-500 border-rose-600 text-white',
  },
  INTERVIEW: {
    badge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    chip: 'bg-amber-500 border-amber-600 text-white',
  },
};

const PAGE_SIZE = 10;
const ACTIVE_STATUSES: ApiAppointmentStatus[] = ['SCHEDULED', 'RESCHEDULED'];

function formatYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toDateInput(iso: string): string {
  return formatYmd(new Date(iso));
}

function toTimeInput(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** Real current month, computed fresh every load — never a fixed calendar date. */
function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: formatYmd(from), to: formatYmd(to) };
}

interface AppointmentFormState {
  customerId: string;
  type: ApiAppointmentType;
  date: string;
  time: string;
  location: string;
  assignedStaffId: string;
  notes: string;
}

const emptyForm: AppointmentFormState = {
  customerId: '',
  type: APPOINTMENT_TYPE.values[0],
  date: '',
  time: '',
  location: '',
  assignedStaffId: '',
  notes: '',
};

export const AppointmentsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canView = hasPermission('appointment.view');
  const canManage = hasPermission('appointment.manage');

  const [displayMode, setDisplayMode] = useState<DisplayMode>('table');
  const [typeFilter, setTypeFilter] = useState<ApiAppointmentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ApiAppointmentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [calendarRange, setCalendarRange] = useState(() => getCurrentMonthRange());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<ApiAppointment | null>(null);
  const [form, setForm] = useState<AppointmentFormState>(emptyForm);

  const [viewingAppointment, setViewingAppointment] = useState<ApiAppointment | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const staffOptionsQuery = useStaffOptions();

  // Generously-sized single page, same shim pattern as useStaffOptions — the real customer picker
  // this page has always been missing (`.items` never existed on the paginated envelope).
  const customersQuery = useQuery({
    queryKey: ['customers', 'options'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
    enabled: canManage,
    staleTime: 5 * 60 * 1000,
  });
  const customers = customersQuery.data?.data ?? [];

  const tableFilters = useMemo(() => ({
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    page,
    limit: PAGE_SIZE,
  }), [typeFilter, statusFilter, page]);

  const calendarFilters = useMemo(() => ({
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    fromDate: calendarRange.from,
    toDate: calendarRange.to,
    limit: 200,
  }), [typeFilter, statusFilter, calendarRange]);

  const activeFilters = displayMode === 'calendar' ? calendarFilters : tableFilters;
  const { data, isLoading, isError, error } = useAppointments(activeFilters, { enabled: canView });

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const completeAppointment = useCompleteAppointment();
  const cancelAppointment = useCancelAppointment();
  const noShowAppointment = useNoShowAppointment();

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appointments"
          subtitle="Schedule and track VFS document submissions, embassy interviews, biometrics, and office consultations."
          breadcrumbs={[{ label: 'Appointments' }]}
        />
        <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 text-center text-sm text-slate-500 dark:text-slate-400">
          You do not have permission to view appointments.
        </div>
      </div>
    );
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const openCreateModal = () => {
    setEditingAppointment(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditModal = (appointment: ApiAppointment) => {
    setEditingAppointment(appointment);
    setForm({
      customerId: appointment.customerId ?? '',
      type: appointment.type,
      date: toDateInput(appointment.scheduledAt),
      time: toTimeInput(appointment.scheduledAt),
      location: appointment.location ?? '',
      assignedStaffId: appointment.assignedStaffId ?? '',
      notes: appointment.notes ?? '',
    });
    setViewingAppointment(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) return;

    const input: CreateAppointmentInput = {
      type: form.type,
      scheduledAt: combineDateTime(form.date, form.time),
      ...(form.customerId && { customerId: form.customerId }),
      ...(form.location && { location: form.location }),
      ...(form.assignedStaffId && { assignedStaffId: form.assignedStaffId }),
      ...(form.notes && { notes: form.notes }),
    };

    try {
      if (editingAppointment) {
        // NOTE: scheduledAt is always sent here, so the backend will silently flip status to
        // RESCHEDULED itself — we never set status manually, just let the refetch show it.
        await updateAppointment.mutateAsync({ id: editingAppointment.id, input });
        showNotification('success', 'Appointment updated.');
      } else {
        await createAppointment.mutateAsync(input);
        showNotification('success', 'Appointment booked.');
      }
      setIsFormOpen(false);
    } catch (err) {
      showNotification('error', normalizeApiError(err).message);
    }
  };

  const handleStatusAction = async (
    action: 'complete' | 'cancel' | 'noShow',
    id: string,
    successMessage: string,
  ) => {
    try {
      if (action === 'complete') await completeAppointment.mutateAsync(id);
      else if (action === 'cancel') await cancelAppointment.mutateAsync(id);
      else await noShowAppointment.mutateAsync(id);
      showNotification('success', successMessage);
      setViewingAppointment(null);
    } catch (err) {
      showNotification('error', normalizeApiError(err).message);
    }
  };

  const handleEventClick = (info: EventClickInfo) => {
    const appt = (data?.data ?? []).find((a) => a.id === info.event.id);
    if (appt) setViewingAppointment(appt);
  };

  const handleDatesSet = (info: DatesSetInfo) => {
    const from = formatYmd(new Date(info.startStr));
    const to = formatYmd(new Date(info.endStr));
    setCalendarRange((prev) => (prev.from === from && prev.to === to ? prev : { from, to }));
  };

  const events: EventInput[] = (data?.data ?? []).map((a) => ({
    id: a.id,
    title: `${APPOINTMENT_TYPE.labels[a.type] ?? humanizeEnum(a.type)}${a.customer ? ` – ${a.customer.fullName}` : ''}`,
    start: a.scheduledAt,
    className: TYPE_STYLES[a.type]?.chip ?? TYPE_STYLES.OFFICE.chip,
  }));

  const columns: Column<ApiAppointment>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (a) => (
        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${TYPE_STYLES[a.type].badge}`}>
          {APPOINTMENT_TYPE.labels[a.type] ?? humanizeEnum(a.type)}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (a) => (
        a.customer ? (
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{a.customer.fullName}</div>
            <div className="text-[11px] text-slate-500 font-mono">{a.customer.customerCode}</div>
          </div>
        ) : <span className="text-xs text-slate-400">—</span>
      ),
    },
    {
      key: 'scheduledAt',
      header: 'Date & Time',
      render: (a) => (
        <div className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDateTime(a.scheduledAt)}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (a) => (
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{a.location || '—'}</span>
        </div>
      ),
    },
    {
      key: 'assignedStaff',
      header: 'Assigned Staff',
      render: (a) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {a.assignedStaff?.fullName || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Schedule and track VFS document submissions, embassy interviews, biometrics, and office consultations."
        breadcrumbs={[{ label: 'Appointments' }]}
        actions={
          <PermissionGuard permission="appointment.manage">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Book Appointment</span>
            </button>
          </PermissionGuard>
        }
      />

      {notification && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between shadow-xs ${
          notification.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-sm font-medium">
          {normalizeApiError(error).message}
        </div>
      )}

      {/* Control Bar: Display Switcher + Type/Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setDisplayMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              displayMode === 'table' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>
          <button
            onClick={() => setDisplayMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              displayMode === 'calendar' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as ApiAppointmentType | ''); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {APPOINTMENT_TYPE.values.map((t) => (
                <option key={t} value={t}>{APPOINTMENT_TYPE.labels[t]}</option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as ApiAppointmentStatus | ''); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {APPOINTMENT_STATUS.values.map((s) => (
              <option key={s} value={s}>{APPOINTMENT_STATUS.labels[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {displayMode === 'calendar' ? (
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs [&_.fc]:text-xs">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            events={events}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            height="auto"
            dayMaxEvents={3}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyText="No appointments scheduled."
          page={data?.pagination.page ?? page}
          totalPages={data?.pagination.pages ?? 1}
          totalRecords={data?.pagination.total}
          onPageChange={setPage}
          onRowClick={(a) => setViewingAppointment(a)}
          actions={(a) => (
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setViewingAppointment(a)}
                className="p-1.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-sky-500/30 hover:bg-blue-100 transition-all"
                title="View Appointment Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <PermissionGuard permission="appointment.manage">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(a); }}
                  className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 transition-all"
                  title="Reschedule / Edit Appointment"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </PermissionGuard>
            </div>
          )}
        />
      )}

      {/* Book / Reschedule Appointment Form Modal */}
      {isFormOpen && (
        <FormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingAppointment ? 'Reschedule Appointment' : 'Book New Appointment'}
          subtitle="Book VFS biometrics, embassy interviews, or office consultations."
          maxWidth="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- No Customer Linked --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.customerCode})</option>
                  ))}
                </select>
                {customersQuery.isError && (
                  <p className="mt-1 text-[11px] text-rose-600">{normalizeApiError(customersQuery.error).message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Appointment Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ApiAppointmentType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {APPOINTMENT_TYPE.values.map((t) => (
                    <option key={t} value={t}>{APPOINTMENT_TYPE.labels[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. VFS Global Access Towers, Colombo"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Staff</label>
                {staffOptionsQuery.enabled ? (
                  <select
                    value={form.assignedStaffId}
                    onChange={(e) => setForm({ ...form, assignedStaffId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {staffOptionsQuery.options.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={editingAppointment?.assignedStaff?.fullName ?? ''}
                    placeholder="No permission to view staff list"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Bring original passport and printed appointment confirmation sheet..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAppointment.isPending || updateAppointment.isPending}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md disabled:opacity-60"
              >
                {editingAppointment ? 'Save Changes' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* View Appointment Details Modal */}
      {viewingAppointment && (
        <FormModal
          isOpen={!!viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          title="Appointment Details"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${TYPE_STYLES[viewingAppointment.type].badge}`}>
                  {APPOINTMENT_TYPE.labels[viewingAppointment.type] ?? humanizeEnum(viewingAppointment.type)}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">Customer:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{viewingAppointment.customer?.fullName || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date & Time:</span> <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatDateTime(viewingAppointment.scheduledAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Location:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingAppointment.location || 'Not specified'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Assigned Staff:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingAppointment.assignedStaff?.fullName || 'Unassigned'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span> <StatusBadge status={viewingAppointment.status} /></div>
            </div>

            {viewingAppointment.notes && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100">
                <span className="font-bold block mb-1">Notes:</span>
                <p className="whitespace-pre-line">{viewingAppointment.notes}</p>
              </div>
            )}

            <PermissionGuard permission="appointment.manage">
              <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(viewingAppointment)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>
                {ACTIVE_STATUSES.includes(viewingAppointment.status) && (
                  <>
                    <button
                      onClick={() => handleStatusAction('complete', viewingAppointment.id, 'Appointment marked complete.')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold flex items-center gap-1.5 hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleStatusAction('noShow', viewingAppointment.id, 'Appointment marked as no-show.')}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-semibold flex items-center gap-1.5 hover:bg-amber-100"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>No Show</span>
                    </button>
                    <button
                      onClick={() => handleStatusAction('cancel', viewingAppointment.id, 'Appointment cancelled.')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-semibold flex items-center gap-1.5 hover:bg-rose-100"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </PermissionGuard>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default AppointmentsPage;
