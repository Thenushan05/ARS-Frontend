import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, User, Phone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import FormModal from '../../components/modals/FormModal';
import { AppointmentItem } from '../../types';
import { appointmentsApi } from '../../api';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<AppointmentItem['type']>('VFS Appointment');
  const [date, setDate] = useState('2026-08-22');
  const [time, setTime] = useState('09:30 AM');
  const [location, setLocation] = useState('VFS Global Access Towers, Colombo');
  const [consultant, setConsultant] = useState('Nimali Fernando');

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    await appointmentsApi.create({
      title,
      customerName,
      phone,
      type,
      date,
      time,
      location,
      consultant
    });
    setIsModalOpen(false);
    fetchAppointments();
  };

  const columns: Column<AppointmentItem>[] = [
    { key: 'title', header: 'Appointment & Type', render: (a) => (
      <div>
        <div className="font-bold text-slate-100 text-xs">{a.title}</div>
        <div className="text-[11px] text-purple-400 font-semibold">{a.type}</div>
      </div>
    )},
    { key: 'customerName', header: 'Client', render: (a) => (
      <div>
        <div className="text-slate-200 text-xs font-semibold">{a.customerName}</div>
        <div className="text-[11px] text-slate-400">{a.phone}</div>
      </div>
    )},
    { key: 'date', header: 'Date & Time', render: (a) => (
      <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{a.date} at {a.time}</span>
      </div>
    )},
    { key: 'location', header: 'Location / Venue', render: (a) => <span className="text-xs text-slate-300">{a.location || 'Online'}</span> },
    { key: 'consultant', header: 'Consultant', render: (a) => <span className="text-xs text-slate-300">{a.consultant}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments Calendar"
        subtitle="Schedule and track VFS document submissions, embassy interviews, biometrics, and office consultations."
        breadcrumbs={[{ label: 'Appointments' }]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        }
      />

      <DataTable columns={columns} data={appointments} isLoading={isLoading} />

      {/* Book Appointment Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Client Appointment"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300">Appointment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. France Schengen VFS Submission..."
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-300">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              >
                <option value="VFS Appointment">VFS Appointment</option>
                <option value="Embassy Appointment">Embassy Appointment</option>
                <option value="Office Appointment">Office Consultation</option>
                <option value="Biometrics">Biometrics</option>
                <option value="Interview">Interview</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
              />
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
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-500/20"
            >
              Schedule Appointment
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AppointmentsPage;
