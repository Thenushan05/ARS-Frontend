import React, { useState } from 'react';
import { 
  Briefcase, CheckCircle2, Clock, FileCheck, Upload, Download, 
  Printer, CreditCard, Calendar, AlertCircle, ShieldCheck, MapPin, Phone, Eye, Check, Plus,
  Sparkles, ArrowRight, FileText, ChevronRight, UserCheck, MessageCircle, HeartHandshake,
  HelpCircle, CheckCircle
} from 'lucide-react';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';

export const CustomerPortalPage: React.FC = () => {
  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('Bank Statement');
  const [uploadFileName, setUploadFileName] = useState('');

  const [isBookAptModalOpen, setIsBookAptModalOpen] = useState(false);
  const [aptType, setAptType] = useState('Office Appointment');
  const [aptDate, setAptDate] = useState('2026-08-25');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptNotes, setAptNotes] = useState('');

  const [viewingReceipt, setViewingReceipt] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Customer Data (Sanduni De Silva)
  const clientData = {
    customerName: 'Sanduni De Silva',
    firstName: 'Sanduni',
    customerId: 'CUST-002',
    phone: '+94 77 444 3322',
    email: 'sanduni@example.com',
    caseId: 'CAS-9002',
    country: 'France',
    visaType: 'Schengen Tourist Visa',
    packageTitle: 'France Schengen Tourist Visa Package',
    currentStage: 'VFS Appointment Booked',
    totalFee: 135000,
    paidAmount: 70000,
    balance: 65000,
    dueDate: 'August 30, 2026',
    assignedConsultant: 'Nimali Fernando',
    consultantPhone: '+94 77 123 4567'
  };

  // Payment Progress Percentage
  const paymentPercentage = Math.round((clientData.paidAmount / clientData.totalFee) * 100);

  // Friendly Consumer Application Timeline
  const timelineSteps = [
    { step: 1, title: 'Document Collection', status: 'Completed', detail: 'All primary certificates submitted', date: 'Jul 28, 2026' },
    { step: 2, title: 'Document Verification', status: 'Completed', detail: 'Verified by ARS Compliance Team', date: 'Aug 05, 2026' },
    { step: 3, title: 'VFS Appointment Booked', status: 'In Progress', detail: 'Scheduled for Aug 22, 2026 at 09:30 AM', date: 'Aug 22, 2026' },
    { step: 4, title: 'Embassy Processing', status: 'Pending', detail: 'Embassy review & decision', date: 'Upcoming' },
    { step: 5, title: 'Passport Ready', status: 'Pending', detail: 'Collection at ARS Colombo', date: 'Upcoming' },
  ];

  // Required Client Documents Checklist
  const requiredDocs = [
    { id: 'req-1', type: 'Bank Statement', description: 'Certified 6-Month Bank Statement (Original Stamped)', status: 'Action Required' },
    { id: 'req-2', type: 'NIC Translation', description: 'Certified English Translation of National Identity Card', status: 'Received' }
  ];

  // Received & Verified Documents
  const receivedDocs = [
    { id: 'doc-101', name: 'Sanduni_DeSilva_Passport.pdf', type: 'Passport Bio-Page', date: 'Jul 28, 2026', status: 'Verified' },
    { id: 'doc-102', name: 'Employment_Cover_Letter.pdf', type: 'Employment Letter', date: 'Aug 02, 2026', status: 'Verified' },
    { id: 'doc-103', name: 'Schengen_Travel_Insurance.pdf', type: 'Travel Insurance Policy', date: 'Aug 10, 2026', status: 'Verified' }
  ];

  // Payment Log
  const paymentsList = [
    { id: 'pmt-1', date: 'Jul 28, 2026', receiptNo: 'REC-2026-101', amount: 70000, method: 'Bank Transfer', for: 'Advance payment for France Schengen Package' }
  ];

  // Upcoming Scheduled Appointments
  const appointmentsList = [
    { id: 'apt-1', title: 'France Schengen VFS Biometrics & Submission', date: 'Saturday, August 22, 2026', time: '09:30 AM', location: 'VFS Global Access Towers, Union Place, Colombo 02', type: 'VFS Appointment' }
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(`Document "${uploadFileName || uploadDocType}" uploaded successfully! Our team will verify it within 24 hours.`);
    setTimeout(() => setNotification(null), 5000);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline text-xs">Dismiss</button>
        </div>
      )}

      {/* 1. WARM PERSONAL GREETING BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Welcome Back
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Hello, {clientData.firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-2xl leading-relaxed">
            Welcome to your personal France Schengen Visa Application Portal. Your application is currently on track for VFS submission.
          </p>
        </div>
      </div>

      {/* 2. QUICK CONSUMER ACTION BUTTONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all text-left space-y-2 group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-all">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Upload Document</span>
            <span className="text-[10px] text-slate-500 font-medium block">Submit bank statement/NIC</span>
          </div>
        </button>

        <button
          onClick={() => setIsBookAptModalOpen(true)}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all text-left space-y-2 group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-all">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">Book Appointment</span>
            <span className="text-[10px] text-slate-500 font-medium block">Schedule office consultation</span>
          </div>
        </button>

        <button
          onClick={() => setViewingReceipt(true)}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all text-left space-y-2 group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-all">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">View e-Receipt</span>
            <span className="text-[10px] text-slate-500 font-medium block">Download payment PDF</span>
          </div>
        </button>

        <a
          href={`https://wa.me/${clientData.consultantPhone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all text-left space-y-2 group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-all">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">WhatsApp Support</span>
            <span className="text-[10px] text-slate-500 font-medium block">Chat with {clientData.assignedConsultant}</span>
          </div>
        </a>
      </div>

      {/* 3. VISA APPLICATION STATUS CONSUMER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider block">CURRENT APPLICATION STATUS</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{clientData.packageTitle}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Application Reference: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{clientData.caseId}</span></p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>VFS Appointment Scheduled</span>
          </div>
        </div>

        {/* Friendly Step Progress */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Step-by-Step Progress</h3>
          <div className="space-y-3">
            {timelineSteps.map((s) => {
              const isDone = s.status === 'Completed';
              const isInProgress = s.status === 'In Progress';

              return (
                <div key={s.step} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  isDone 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                    : isInProgress
                    ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/20'
                    : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDone ? 'bg-emerald-600 text-white' : isInProgress ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{s.detail}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isDone ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : isInProgress ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}>
                    {s.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MY DOCUMENTS CHECKLIST & VERIFIED VAULT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="documents">
        {/* Documents Required */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Documents Required From You</span>
            </h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {requiredDocs.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-amber-950 dark:text-amber-200 block text-xs">{item.type}</span>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-snug">{item.description}</p>
                </div>
                <button
                  onClick={() => {
                    setUploadDocType(item.type);
                    setIsUploadModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0"
                >
                  Upload
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Received & Verified */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Your Verified Documents Vault</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {receivedDocs.length} Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {receivedDocs.map(doc => (
              <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">{doc.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{doc.type} • Uploaded: {doc.date}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. MY PAYMENTS & RECEIPT OVERVIEW */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6" id="payments">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Payments & Official e-Receipts</span>
          </h3>
        </div>

        {/* Financial Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Total Package Fee</span>
            <CurrencyDisplay amount={clientData.totalFee} className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono" />
            <span className="text-[11px] text-slate-500 block">All inclusive visa service</span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block uppercase tracking-wider">Amount Paid</span>
            <CurrencyDisplay amount={clientData.paidAmount} className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono" />
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block">{paymentPercentage}% Paid Received</span>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block uppercase tracking-wider">Remaining Balance</span>
            <CurrencyDisplay amount={clientData.balance} className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono" />
            <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold block">Due by {clientData.dueDate}</span>
          </div>
        </div>

        {/* Payment History List */}
        <div className="space-y-3 text-xs pt-2">
          {paymentsList.map(pmt => (
            <div key={pmt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{pmt.for}</span>
                <p className="text-[11px] text-slate-500">Date: {pmt.date} | Receipt #{pmt.receiptNo}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <CurrencyDisplay amount={pmt.amount} className="text-lg font-black text-emerald-600 font-mono" />
                <button
                  onClick={() => setViewingReceipt(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. MY SCHEDULED APPOINTMENTS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4" id="appointments">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Your Scheduled Appointments</span>
          </h3>
          <button
            onClick={() => setIsBookAptModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Slot</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {appointmentsList.map(apt => (
            <div key={apt.id} className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  {apt.type}
                </span>
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">{apt.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {apt.location}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-center font-mono shrink-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">DATE & TIME</span>
                <span className="text-xs font-bold text-amber-600 block">{apt.date}</span>
                <span className="text-base font-black text-blue-600 block">{apt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. NEED HELP / ASSIGNED CONSULTANT SUPPORT CARD */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
            NF
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">Assigned Consultant: {clientData.assignedConsultant}</span>
            <p className="text-slate-500 font-medium">Need help with documents or appointments? We are here to assist you.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${clientData.consultantPhone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
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

      {/* BOOK APPOINTMENT MODAL */}
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

      {/* OFFICIAL E-RECEIPT MODAL VIEW */}
      {viewingReceipt && (
        <FormModal
          isOpen={viewingReceipt}
          onClose={() => setViewingReceipt(false)}
          title="Official Payment Receipt — REC-2026-101"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Top Fixed Action Bar */}
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
