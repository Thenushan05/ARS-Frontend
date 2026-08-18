import React, { useState } from 'react';
import { 
  Briefcase, CheckCircle2, Clock, FileCheck, Upload, Download, 
  Printer, CreditCard, Calendar, AlertCircle, ShieldCheck, MapPin, Phone, Eye, Check, Plus
} from 'lucide-react';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';

export const CustomerPortalPage: React.FC = () => {
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('Bank Statement');
  const [uploadFileName, setUploadFileName] = useState('');

  // Book Appointment Modal State
  const [isBookAptModalOpen, setIsBookAptModalOpen] = useState(false);
  const [aptType, setAptType] = useState('Office Appointment');
  const [aptDate, setAptDate] = useState('2026-08-25');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptNotes, setAptNotes] = useState('');

  // Receipt Modal View State
  const [viewingReceipt, setViewingReceipt] = useState<boolean>(false);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Mock Customer Application Data (Sanduni De Silva)
  const clientData = {
    customerName: 'Sanduni De Silva',
    customerId: 'CUST-002',
    phone: '+94 77 444 3322',
    email: 'sanduni@example.com',
    caseId: 'CAS-9002',
    country: 'France',
    visaType: 'Schengen Tourist Visa',
    packageTitle: 'France Schengen Premium Visa Package',
    currentStage: 'VFS Biometrics & Submission',
    totalFee: 135000,
    paidAmount: 70000,
    balance: 65000,
    dueDate: '2026-08-30'
  };

  // Live Application Timeline Steps
  const timelineSteps = [
    { step: 1, title: 'Document Collection', status: 'Completed', date: '2026-07-28' },
    { step: 2, title: 'Document Verification', status: 'Completed', date: '2026-08-05' },
    { step: 3, title: 'VFS Appointment Booked', status: 'In Progress', date: '2026-08-22' },
    { step: 4, title: 'Embassy Processing', status: 'Pending', date: 'Upcoming' },
    { step: 5, title: 'Passport Ready', status: 'Pending', date: 'Upcoming' },
  ];

  // Documents Required from Client
  const [requiredDocs, setRequiredDocs] = useState([
    { id: 'req-1', type: 'Bank Statement', description: 'Certified 6-Month Bank Statement (Original Stamped)', status: 'Action Required' },
    { id: 'req-2', type: 'NIC Translation', description: 'Certified English Translation of National Identity Card', status: 'Received' }
  ]);

  // Documents Received & Verified
  const receivedDocs = [
    { id: 'doc-101', name: 'Sanduni_DeSilva_Passport.pdf', type: 'Passport', date: '2026-07-28', status: 'Verified' },
    { id: 'doc-102', name: 'Employment_Cover_Letter.pdf', type: 'Employment Letter', date: '2026-08-02', status: 'Verified' },
    { id: 'doc-103', name: 'Schengen_Travel_Insurance.pdf', type: 'Insurance', date: '2026-08-10', status: 'Verified' }
  ];

  // Payment Payouts
  const paymentsList = [
    { id: 'pmt-1', date: '2026-07-28', receiptNo: 'REC-2026-101', amount: 70000, method: 'Bank Transfer', for: 'Advance payment for France Schengen Package' }
  ];

  // Upcoming Appointments
  const appointmentsList = [
    { id: 'apt-1', title: 'France Schengen VFS Biometrics & Submission', date: 'August 22, 2026', time: '09:30 AM', location: 'VFS Global Access Towers, Colombo', type: 'VFS Appointment' }
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(`Document "${uploadFileName || uploadDocType}" uploaded successfully! Our team will verify it within 24 hours.`);
    setTimeout(() => setNotification(null), 5000);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* 1. MY APPLICATION & CURRENT STATUS HEADER CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-500/30 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
              {clientData.country} Visa Case — Ref #{clientData.caseId}
            </span>
            <h1 className="text-xl sm:text-2xl font-black">{clientData.packageTitle}</h1>
            <p className="text-xs text-blue-200">Registered Client: {clientData.customerName} ({clientData.customerId})</p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">CURRENT STAGE</span>
            <span className="text-sm font-black text-amber-300 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{clientData.currentStage}</span>
            </span>
          </div>
        </div>

        {/* 5-Stage Live Application Progress Timeline */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">Live Application Progress Timeline</span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            {timelineSteps.map((s) => (
              <div 
                key={s.step} 
                className={`p-3 rounded-2xl border transition-all ${
                  s.status === 'Completed'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : s.status === 'In Progress'
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-md'
                    : 'bg-white/5 border-white/10 text-blue-200/60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span>Step {s.step}</span>
                  {s.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="font-bold text-xs leading-tight">{s.title}</p>
                <p className="text-[10px] opacity-75 mt-1 font-mono">{s.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL OVERVIEW & BALANCE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="payments">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">TOTAL PACKAGE FEE</span>
          <CurrencyDisplay amount={clientData.totalFee} className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono" />
          <span className="text-[11px] text-slate-500 block">All inclusive visa service charges</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">TOTAL AMOUNT PAID</span>
          <CurrencyDisplay amount={clientData.paidAmount} className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono" />
          <span className="text-[11px] text-emerald-600 font-bold block">Advance payment received</span>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">REMAINING BALANCE DUE</span>
          <CurrencyDisplay amount={clientData.balance} className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono" />
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold block">Due by {clientData.dueDate} before embassy filing</span>
        </div>
      </div>

      {/* 3. DOCUMENTS SECTION: REQUIRED & RECEIVED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="documents">
        {/* Documents Required Checklist */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Documents Required Checklist</span>
            </h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {requiredDocs.map(item => (
              <div key={item.id} className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-amber-950 dark:text-amber-200 block text-xs">{item.type}</span>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 truncate">{item.description}</p>
                </div>
                <button
                  onClick={() => {
                    setUploadDocType(item.type);
                    setIsUploadModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0"
                >
                  Upload File
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Received & Verified */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Documents Received & Verified</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {receivedDocs.length} Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {receivedDocs.map(doc => (
              <div key={doc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">{doc.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{doc.type} | Uploaded: {doc.date}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PAYMENTS & RECEIPTS SECTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Payments History & Official e-Receipts</span>
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          {paymentsList.map(pmt => (
            <div key={pmt.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{pmt.for}</span>
                  <span className="font-mono text-purple-600 font-bold text-[11px]">{pmt.receiptNo}</span>
                </div>
                <p className="text-[11px] text-slate-500">Date: {pmt.date} | Payment Method: {pmt.method}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <CurrencyDisplay amount={pmt.amount} className="text-lg font-black text-emerald-600 font-mono" />
                <button
                  onClick={() => setViewingReceipt(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View e-Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. UPCOMING APPOINTMENTS SECTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" id="appointments">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Upcoming Scheduled Appointments</span>
          </h3>
          <button
            onClick={() => setIsBookAptModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Request Appointment</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {appointmentsList.map(apt => (
            <div key={apt.id} className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  {apt.type}
                </span>
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">{apt.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {apt.location}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 text-center font-mono shrink-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">DATE & TIME</span>
                <span className="text-xs font-bold text-amber-600 block">{apt.date}</span>
                <span className="text-sm font-black text-blue-600 block">{apt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOK APPOINTMENT MODAL FOR CLIENT */}
      {isBookAptModalOpen && (
        <FormModal
          isOpen={isBookAptModalOpen}
          onClose={() => setIsBookAptModalOpen(false)}
          title="Schedule Appointment with ARS Consultants"
          subtitle={`Client: ${clientData.customerName} | Case: ${clientData.caseId}`}
          maxWidth="md"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setNotification(`Appointment request submitted for ${aptDate} at ${aptTime}! Our consultants will confirm your slot via SMS/WhatsApp.`);
              setTimeout(() => setNotification(null), 5000);
              setIsBookAptModalOpen(false);
            }} 
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Appointment Type</label>
              <select
                value={aptType}
                onChange={(e) => setAptType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="Office Appointment">Head Office Consultation (Union Place, Colombo)</option>
                <option value="Online Consultation">Online Video Call Consultation (Zoom/Google Meet)</option>
                <option value="VFS Appointment">VFS Biometrics & Submission Check</option>
                <option value="Embassy Appointment">Embassy Interview Briefing</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={aptDate}
                  onChange={(e) => setAptDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Time Slot</label>
                <select
                  value={aptTime}
                  onChange={(e) => setAptTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="09:30 AM">09:30 AM (Morning Slot)</option>
                  <option value="11:30 AM">11:30 AM (Late Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                  <option value="04:30 PM">04:30 PM (Evening Slot)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Questions for Consultant</label>
              <textarea
                rows={2}
                placeholder="e.g. Need help reviewing bank statement before VFS submission..."
                value={aptNotes}
                onChange={(e) => setAptNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBookAptModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
              >
                Request Appointment Slot
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* UPLOAD DOCUMENT MODAL FOR CLIENT */}
      {isUploadModalOpen && (
        <FormModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload Document for France Visa Application"
          subtitle={`Client: ${clientData.customerName} | Case: ${clientData.caseId}`}
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Document Category</label>
              <select
                value={uploadDocType}
                onChange={(e) => setUploadDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="Bank Statement">6-Month Stamped Bank Statement</option>
                <option value="NIC Translation">NIC Certified English Translation</option>
                <option value="Employment Letter">Employment / Leave Approval Letter</option>
                <option value="Passport Copy">Passport Bio-Page Copy</option>
                <option value="Other">Other Document</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">File Name / Description</label>
              <input
                type="text"
                placeholder="e.g. Commercial_Bank_Statement_Aug2026.pdf"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select File (PDF, PNG, JPG)</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-300 dark:border-slate-800">
                <Upload className="w-5 h-5 text-slate-400" />
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && !uploadFileName) {
                      setUploadFileName(e.target.files[0].name);
                    }
                  }}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
              >
                Submit Document
              </button>
            </div>
          </form>
        </FormModal>
      )}

      {/* OFFICIAL E-RECEIPT MODAL VIEW (Download PDF & Print Buttons) */}
      {viewingReceipt && (
        <FormModal
          isOpen={viewingReceipt}
          onClose={() => setViewingReceipt(false)}
          title="Official Payment Receipt — REC-2026-101"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Top Fixed Sticky Action Toolbar */}
            <div className="sticky -top-6 z-30 no-print bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-md">
              <span className="font-bold text-xs text-emerald-400">Official Receipt Document REC-2026-101</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#6b3a69] hover:bg-[#5a2e58] text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => alert('Downloading official receipt PDF...')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Corporate e-Receipt Card (#6b3a69 Accent Style) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-900 space-y-4 print-card">
              <div className="flex justify-between items-start border-b-2 border-[#6b3a69] pb-4">
                <div>
                  <h2 className="text-base font-black text-[#6b3a69]">ARS VISA & CONSULTANTS</h2>
                  <p className="text-[11px] text-slate-600">No. 14, Access Towers, Union Place, Colombo 02</p>
                  <p className="text-[11px] text-slate-600">Hotline: +94 11 234 5678 | Email: info@arsvisa.com</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-black text-[#6b3a69] tracking-wider">RECEIPT</h1>
                  <p className="font-mono text-xs font-bold text-slate-700">REC-2026-101</p>
                  <p className="text-[11px] text-slate-500">Date: 2026-07-28</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="font-bold text-[#6b3a69] block">Billed To:</span>
                  <p className="font-bold text-slate-900">{clientData.customerName}</p>
                  <p className="text-slate-600">{clientData.phone}</p>
                  <p className="text-slate-600">Customer ID: {clientData.customerId}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#6b3a69] block">Payment Metadata:</span>
                  <p className="text-slate-700"><span className="font-semibold">Case Ref:</span> {clientData.caseId}</p>
                  <p className="text-slate-700"><span className="font-semibold">Method:</span> Bank Transfer</p>
                </div>
              </div>

              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-[#6b3a69] text-white">
                  <tr>
                    <th className="p-2">QTY</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-mono">1</td>
                    <td className="p-2 font-semibold">Advance Payment — France Schengen Tourist Visa Package</td>
                    <td className="p-2 text-right font-mono font-bold">70,000</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-64 border-t-2 border-b-2 border-[#6b3a69] py-2 text-xs font-bold space-y-1">
                  <div className="flex justify-between"><span className="text-slate-600">Total Billed:</span> <span className="font-mono">LKR 135,000</span></div>
                  <div className="flex justify-between text-[#6b3a69] text-sm font-black"><span>Total Paid:</span> <span className="font-mono">LKR 70,000</span></div>
                  <div className="flex justify-between text-rose-600"><span className="text-slate-600">Balance Due:</span> <span className="font-mono">LKR 65,000</span></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500">
                <p className="font-bold text-[#6b3a69]">Thank you for choosing ARS Visa & Consultants.</p>
                <p>This is a computer-generated official receipt.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingReceipt(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default CustomerPortalPage;
