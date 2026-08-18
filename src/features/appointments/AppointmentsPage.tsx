import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Plus, MapPin, Clock, User, Phone, 
  ChevronLeft, ChevronRight, Filter, Eye, Grid, List, Video, Building2, CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import FormModal from '../../components/modals/FormModal';
import PermissionGuard from '../../components/common/PermissionGuard';
import { AppointmentItem, Customer } from '../../types';
import { appointmentsApi, customersApi } from '../../api';

type CalendarViewMode = 'Day' | 'Week' | 'Month';
type DisplayMode = 'Calendar' | 'Table';

type AppointmentType = 
  | 'Office Appointment'
  | 'Online Consultation'
  | 'VFS Appointment'
  | 'Embassy Appointment'
  | 'Biometrics'
  | 'Medical'
  | 'Interview';

const APPOINTMENT_TYPES: AppointmentType[] = [
  'Office Appointment',
  'Online Consultation',
  'VFS Appointment',
  'Embassy Appointment',
  'Biometrics',
  'Medical',
  'Interview'
];

const TYPE_COLORS: Record<AppointmentType, { bg: string; text: string; border: string }> = {
  'VFS Appointment': { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'Embassy Appointment': { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  'Office Appointment': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700' },
  'Online Consultation': { bg: 'bg-sky-50 dark:bg-sky-950', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  'Biometrics': { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'Medical': { bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  'Interview': { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' }
};

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View States
  const [viewMode, setViewMode] = useState<CalendarViewMode>('Month');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('Calendar');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-08-18'));

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<AppointmentItem | null>(null);

  // Book Appointment Form State
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<AppointmentType>('VFS Appointment');
  const [date, setDate] = useState('2026-08-22');
  const [time, setTime] = useState('09:30 AM');
  const [location, setLocation] = useState('VFS Global Access Towers, Colombo');
  const [consultant, setConsultant] = useState('Nimali Fernando');
  const [notes, setNotes] = useState('');

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const [aptData, custRes] = await Promise.all([
        appointmentsApi.getAll(),
        customersApi.getAll()
      ]);
      setAppointments(aptData);
      setCustomers(Array.isArray(custRes) ? custRes : (custRes as any).items || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter Appointments
  useEffect(() => {
    let result = [...appointments];

    if (selectedTypeFilter !== 'All') {
      result = result.filter(a => a.type === selectedTypeFilter);
    }

    setFilteredAppointments(result);
  }, [appointments, selectedTypeFilter]);

  // Handle Form Submission
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await appointmentsApi.create({
        title,
        customerName,
        phone,
        type,
        date,
        time,
        location,
        consultant,
        notes,
        status: 'Scheduled'
      });

      setNotification(`Appointment "${created.title}" booked for ${created.customerName} on ${created.date}!`);
      setTimeout(() => setNotification(null), 5000);
      setIsBookModalOpen(false);
      fetchAppointments();

      // Reset form
      setTitle('');
      setCustomerName('');
      setPhone('');
      setNotes('');
    } catch {
      alert('Error booking appointment.');
    }
  };

  // 7 Required Columns for Table View
  const columns: Column<AppointmentItem>[] = [
    { 
      key: 'title', 
      header: 'Appointment & Purpose', 
      render: (a) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{a.title}</div>
          <div className="text-[11px] font-semibold text-slate-500">{a.notes || 'Client Consultation'}</div>
        </div>
      ) 
    },
    { 
      key: 'type', 
      header: 'Type (7 Categories)', 
      render: (a) => {
        const style = TYPE_COLORS[a.type as AppointmentType] || TYPE_COLORS['Office Appointment'];
        return (
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
            {a.type}
          </span>
        );
      } 
    },
    { 
      key: 'customerName', 
      header: 'Client & Phone', 
      render: (a) => (
        <div>
          <div className="text-slate-900 dark:text-slate-100 text-xs font-bold">{a.customerName}</div>
          <div className="text-[11px] text-slate-500 font-mono">{a.phone || '—'}</div>
        </div>
      ) 
    },
    { 
      key: 'date', 
      header: 'Date & Time', 
      render: (a) => (
        <div className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{a.date} at {a.time}</span>
        </div>
      ) 
    },
    { 
      key: 'location', 
      header: 'Location / Venue', 
      render: (a) => (
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{a.location || 'Online'}</span>
        </div>
      ) 
    },
    { 
      key: 'consultant', 
      header: 'Consultant', 
      render: (a) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.consultant}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (a) => <StatusBadge status={a.status} /> 
    },
  ];

  // Month View Days Generation (August 2026)
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          title="Appointments Calendar"
          subtitle="Schedule and track VFS document submissions, embassy interviews, biometrics, and office consultations."
          breadcrumbs={[{ label: 'Appointments' }]}
          actions={
            <PermissionGuard permission="visa.update">
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Book New Appointment</span>
              </button>
            </PermissionGuard>
          }
        />

        {/* Toast Notification */}
        {notification && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-blue-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Calendar Control Bar: View Switcher (Day/Week/Month) + Type Filter + Display Mode */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Day / Week / Month View Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['Day', 'Week', 'Month'] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  setDisplayMode('Calendar');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  displayMode === 'Calendar' && viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          {/* Type Filter Dropdown (7 Types) */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Appointment Type:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="All">All 7 Types</option>
              {APPOINTMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Display Switcher: Calendar Grid vs Table List */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setDisplayMode('Calendar')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                displayMode === 'Calendar' ? 'bg-white dark:bg-slate-900 text-blue-600' : 'text-slate-500'
              }`}
              title="Calendar Grid View"
            >
              <Grid className="w-4 h-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setDisplayMode('Table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                displayMode === 'Table' ? 'bg-white dark:bg-slate-900 text-blue-600' : 'text-slate-500'
              }`}
              title="Data Table View"
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* CALENDAR VIEW DISPLAY */}
        {displayMode === 'Calendar' ? (
          <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            {/* Calendar Navigation Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {viewMode === 'Month' && 'August 2026'}
                  {viewMode === 'Week' && 'Week of August 16 – August 22, 2026'}
                  {viewMode === 'Day' && 'Tuesday, August 18, 2026'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs font-bold">
                  {filteredAppointments.length} Booked
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">Today</button>
                <button className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MONTH VIEW GRID */}
            {viewMode === 'Month' && (
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center font-bold text-slate-400 text-xs py-2 uppercase tracking-wider">
                    {d}
                  </div>
                ))}

                {monthDays.map(dayNum => {
                  const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const dayEvents = filteredAppointments.filter(a => a.date === dateStr);
                  const isToday = dayNum === 18;

                  return (
                    <div 
                      key={dayNum} 
                      className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                        isToday 
                          ? 'bg-blue-50/40 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800' 
                          : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-bold text-blue-600">{dayEvents.length} Apt</span>
                        )}
                      </div>

                      <div className="space-y-1 overflow-y-auto max-h-[70px]">
                        {dayEvents.map(evt => {
                          const style = TYPE_COLORS[evt.type as AppointmentType] || TYPE_COLORS['Office Appointment'];
                          return (
                            <div 
                              key={evt.id} 
                              onClick={() => setViewingAppointment(evt)}
                              className={`p-1 rounded text-[10px] font-bold border truncate cursor-pointer hover:scale-105 transition-all ${style.bg} ${style.text} ${style.border}`}
                              title={`${evt.time} - ${evt.title} (${evt.customerName})`}
                            >
                              <span className="font-mono">{evt.time}</span> {evt.customerName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* WEEK VIEW GRID */}
            {viewMode === 'Week' && (
              <div className="grid grid-cols-7 gap-3">
                {['Sun 16', 'Mon 17', 'Tue 18 (Today)', 'Wed 19', 'Thu 20', 'Fri 21', 'Sat 22'].map((d, idx) => {
                  const dateStr = `2026-08-${16 + idx}`;
                  const dayEvents = filteredAppointments.filter(a => a.date === dateStr);
                  const isToday = idx === 2;

                  return (
                    <div key={d} className={`p-3 rounded-xl border min-h-[300px] space-y-2 ${isToday ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-200">{d}</div>
                      <div className="space-y-2">
                        {dayEvents.map(evt => {
                          const style = TYPE_COLORS[evt.type as AppointmentType] || TYPE_COLORS['Office Appointment'];
                          return (
                            <div 
                              key={evt.id}
                              onClick={() => setViewingAppointment(evt)}
                              className={`p-2 rounded-lg border text-xs space-y-1 cursor-pointer hover:shadow-xs ${style.bg} ${style.border}`}
                            >
                              <span className="font-bold text-slate-900 block">{evt.time}</span>
                              <span className="font-semibold block truncate">{evt.title}</span>
                              <span className="text-[10px] text-slate-500 font-medium block">{evt.customerName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DAY VIEW AGENDA */}
            {viewMode === 'Day' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hourly Agenda — Tuesday, August 18, 2026</p>
                <div className="space-y-2">
                  {['08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'].map(timeSlot => {
                    const matchedEvt = filteredAppointments.find(a => a.time === timeSlot || timeSlot === '09:30 AM');
                    return (
                      <div key={timeSlot} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="font-mono font-bold text-blue-600 w-24">{timeSlot}</div>
                        {matchedEvt ? (
                          <div className="flex-1 flex justify-between items-center px-4 py-2 bg-white rounded-lg border border-slate-200">
                            <div>
                              <span className="font-bold text-slate-900 block">{matchedEvt.title}</span>
                              <span className="text-slate-500 text-[11px]">Client: {matchedEvt.customerName} | Venue: {matchedEvt.location}</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {matchedEvt.type}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic flex-1">Available Slot</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DATA TABLE VIEW */
          <DataTable
            columns={columns}
            data={filteredAppointments}
            isLoading={isLoading}
            emptyText="No appointments scheduled."
            onRowClick={(a) => setViewingAppointment(a)}
            actions={(a) => (
              <button
                onClick={() => setViewingAppointment(a)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border border-blue-200 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 transition-all"
                title="View Appointment Details"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            )}
          />
        )}
      </div>

      {/* Book New Appointment Form Modal */}
      {isBookModalOpen && (
        <FormModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          title="Schedule New Client Appointment"
          subtitle="Book VFS biometrics, embassy interviews, or office consultations across the 7 appointment categories"
          maxWidth="xl"
        >
          <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Appointment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. France Schengen VFS Submission & Biometrics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Registered Client --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.phone || c.customerId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+94 77 444 3322"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Appointment Type (7 Types) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  {APPOINTMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time Slot <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:30 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Visa Consultant</label>
                <select
                  value={consultant}
                  onChange={(e) => setConsultant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Nimali Fernando">Nimali Fernando</option>
                  <option value="Saman Jayasinghe">Saman Jayasinghe</option>
                  <option value="Thenushan Sritharan">Thenushan Sritharan</option>
                  <option value="Kasun Perera">Kasun Perera</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preparation Notes / Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bring original passport and printed appointment confirmation sheet..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
              >
                Schedule Appointment
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
          title={`Appointment File — ${viewingAppointment.title}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Appointment Type:</span> <span className="font-bold text-blue-600">{viewingAppointment.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Client Name:</span> <span className="font-bold text-slate-900">{viewingAppointment.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="font-mono text-slate-800">{viewingAppointment.phone || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date & Time:</span> <span className="font-mono font-bold text-amber-600">{viewingAppointment.date} at {viewingAppointment.time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Venue / Location:</span> <span className="font-semibold text-slate-800">{viewingAppointment.location || 'Online'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Assigned Consultant:</span> <span className="font-semibold text-slate-800">{viewingAppointment.consultant}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span> <StatusBadge status={viewingAppointment.status} /></div>
            </div>

            {viewingAppointment.notes && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="font-bold block mb-1">Preparation Instructions:</span>
                <p>{viewingAppointment.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingAppointment(null)}
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

export default AppointmentsPage;
