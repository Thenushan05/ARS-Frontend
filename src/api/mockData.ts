import { 
  User, Lead, Customer, VisaCase, EVisaService, MasterPriceItem, 
  PackageItem, Quotation, Invoice, Payment, Receipt, Income, Expense, 
  BankAccount, AccountTransfer, Supplier, StaffMember, StaffPerformance, 
  TaskItem, AppointmentItem, DocumentItem 
} from '../types';

export const CURRENT_USER_MOCK: User = {
  id: 'user-001',
  name: 'Thenushan Sritharan',
  email: 'admin@arsvisa.com',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  phone: '+94 77 123 4567',
  branch: 'Colombo Main Branch',
  permissions: [
    'lead.view', 'lead.create', 'lead.edit', 'lead.delete', 'lead.convert',
    'customer.view', 'customer.create', 'customer.edit', 'customer.delete',
    'visa.view', 'visa.create', 'visa.update', 'visa.delete',
    'evisa.view', 'evisa.manage',
    'quotation.view', 'quotation.create', 'quotation.edit',
    'invoice.view', 'invoice.create', 'invoice.edit',
    'payment.view', 'payment.create', 'payment.receipt',
    'pricing.view', 'pricing.cost.view', 'pricing.edit',
    'package.view', 'package.create', 'package.discount',
    'supplier.view', 'supplier.create', 'supplier.cost.view',
    'finance.income.view', 'finance.expense.view', 'finance.profit.view', 'finance.banking.view',
    'staff.manage', 'staff.performance',
    'reports.view', 'reports.export',
    'settings.manage'
  ]
};

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    leadId: 'LD-1001',
    name: 'Kavinda Perera',
    phone: '+94 71 234 5678',
    email: 'kavinda.p@gmail.com',
    country: 'France',
    visaType: 'Tourist Visa',
    source: 'Facebook',
    assignedStaff: 'Saman Jayasinghe',
    assignedStaffId: 'staff-2',
    status: 'New Lead',
    notes: 'Interested in Schengen tourist visa for summer holiday.',
    followUpDate: '2026-08-20',
    createdAt: '2026-08-15'
  },
  {
    id: 'lead-2',
    leadId: 'LD-1002',
    name: 'Anjali Silva',
    phone: '+94 77 987 6543',
    email: 'anjali.silva@yahoo.com',
    country: 'United Kingdom',
    visaType: 'Student Visa',
    source: 'Instagram',
    assignedStaff: 'Nimali Fernando',
    assignedStaffId: 'staff-3',
    status: 'Interested',
    notes: 'Master degree offer letter received from University of Leeds.',
    followUpDate: '2026-08-18',
    createdAt: '2026-08-14'
  },
  {
    id: 'lead-3',
    leadId: 'LD-1003',
    name: 'Rohan Wickramasinghe',
    phone: '+94 70 333 4455',
    email: 'rohan.w@outlook.com',
    country: 'Canada',
    visaType: 'Work Visa',
    source: 'Google',
    assignedStaff: 'Saman Jayasinghe',
    assignedStaffId: 'staff-2',
    status: 'Appointment',
    notes: 'LMIA approval received. Consultation scheduled.',
    followUpDate: '2026-08-19',
    createdAt: '2026-08-12'
  },
  {
    id: 'lead-4',
    leadId: 'LD-1004',
    name: 'Dilshan Mendis',
    phone: '+94 76 555 1212',
    email: 'dilshan.m@gmail.com',
    country: 'United Arab Emirates',
    visaType: 'e-Visa',
    source: 'TikTok',
    assignedStaff: 'Nimali Fernando',
    assignedStaffId: 'staff-3',
    status: 'Registered',
    notes: 'Converted to customer CUST-5001.',
    followUpDate: '2026-08-17',
    createdAt: '2026-08-10'
  },
  {
    id: 'lead-5',
    leadId: 'LD-1005',
    name: 'Nimmi Rajapaksha',
    phone: '+94 72 888 9900',
    email: 'nimmi.r@gmail.com',
    country: 'Australia',
    visaType: 'Tourist Visa',
    source: 'Walk-in',
    assignedStaff: 'Thenushan Sritharan',
    assignedStaffId: 'user-001',
    status: 'Follow-up Later',
    notes: 'Waiting for bank statement balance requirement.',
    followUpDate: '2026-08-25',
    createdAt: '2026-08-08'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customerId: 'CUST-5001',
    name: 'Dilshan Mendis',
    phone: '+94 76 555 1212',
    whatsApp: '+94 76 555 1212',
    email: 'dilshan.m@gmail.com',
    passportNumber: 'N7894561',
    assignedConsultant: 'Saman Jayasinghe',
    assignedConsultantId: 'staff-2',
    activeCasesCount: 2,
    status: 'Active',
    address: 'No. 45, Galle Road, Colombo 03',
    nic: '199212304567',
    dateOfBirth: '1992-04-12',
    createdAt: '2026-08-10'
  },
  {
    id: 'cust-2',
    customerId: 'CUST-5002',
    name: 'Sanduni De Silva',
    phone: '+94 77 444 3322',
    whatsApp: '+94 77 444 3322',
    email: 'sanduni.desilva@hotmail.com',
    passportNumber: 'N6549873',
    assignedConsultant: 'Nimali Fernando',
    assignedConsultantId: 'staff-3',
    activeCasesCount: 1,
    status: 'Active',
    address: '12/A, Kandy Road, Kiribathgoda',
    nic: '199587654321',
    dateOfBirth: '1995-11-20',
    createdAt: '2026-07-28'
  },
  {
    id: 'cust-3',
    customerId: 'CUST-5003',
    name: 'Kamal Gunaratne',
    phone: '+94 71 999 8877',
    whatsApp: '+94 71 999 8877',
    email: 'kamal.g@gmail.com',
    passportNumber: 'N1237894',
    assignedConsultant: 'Thenushan Sritharan',
    assignedConsultantId: 'user-001',
    activeCasesCount: 1,
    status: 'Active',
    address: '88, Main Street, Jaffna',
    nic: '198845612378',
    dateOfBirth: '1988-06-05',
    createdAt: '2026-07-15'
  }
];

export const MOCK_VISA_CASES: VisaCase[] = [
  {
    id: 'case-1',
    caseId: 'CAS-9001',
    customerId: 'cust-1',
    customerName: 'Dilshan Mendis',
    customerPhone: '+94 76 555 1212',
    country: 'United Arab Emirates',
    visaCategory: 'e-Visa',
    visaType: '30 Days Tourist e-Visa',
    consultant: 'Saman Jayasinghe',
    consultantId: 'staff-2',
    status: 'Submitted',
    submissionDate: '2026-08-16',
    appointmentDate: undefined,
    notes: 'Submitted via UAE Immigration portal.',
    createdAt: '2026-08-10'
  },
  {
    id: 'case-2',
    caseId: 'CAS-9002',
    customerId: 'cust-2',
    customerName: 'Sanduni De Silva',
    customerPhone: '+94 77 444 3322',
    country: 'France',
    visaCategory: 'Tourist',
    visaType: 'Schengen Short Stay Tourist Visa',
    consultant: 'Nimali Fernando',
    consultantId: 'staff-3',
    status: 'Appointment Booked',
    submissionDate: undefined,
    appointmentDate: '2026-08-22 09:30 AM',
    notes: 'VFS Colombo appointment booked for document submission and biometrics.',
    createdAt: '2026-07-28'
  },
  {
    id: 'case-3',
    caseId: 'CAS-9003',
    customerId: 'cust-3',
    customerName: 'Kamal Gunaratne',
    customerPhone: '+94 71 999 8877',
    country: 'United Kingdom',
    visaCategory: 'Student',
    visaType: 'Tier 4 Student Visa',
    consultant: 'Thenushan Sritharan',
    consultantId: 'user-001',
    status: 'Approved',
    submissionDate: '2026-07-20',
    appointmentDate: '2026-07-25',
    decisionDate: '2026-08-14',
    validityPeriod: '2026-09-01 to 2028-09-30',
    notes: 'Passport collected with stamped visa sticker.',
    createdAt: '2026-07-15'
  },
  {
    id: 'case-4',
    caseId: 'CAS-9004',
    customerId: 'cust-1',
    customerName: 'Dilshan Mendis',
    customerPhone: '+94 76 555 1212',
    country: 'Canada',
    visaCategory: 'Tourist',
    visaType: 'V-1 Visitor Visa',
    consultant: 'Saman Jayasinghe',
    consultantId: 'staff-2',
    status: 'Document Collection',
    submissionDate: undefined,
    appointmentDate: undefined,
    notes: 'Pending bank statements and land valuation report.',
    createdAt: '2026-08-12'
  }
];

export const MOCK_EVISAS: EVisaService[] = [
  {
    id: 'evisa-1',
    country: 'United Arab Emirates',
    visaName: 'UAE 30 Days Express e-Visa',
    entryType: 'Single Entry',
    validity: '60 Days',
    stayPeriod: '30 Days',
    processingTime: '24 - 48 Hours',
    customerSellingPrice: 45000,
    currency: 'LKR',
    status: 'Active',
    lastUpdated: '2026-08-10',
    governmentFee: 28000,
    supplierCost: 5000,
    otherCost: 2000,
    arsServiceCharge: 10000,
    estimatedProfit: 10000
  },
  {
    id: 'evisa-2',
    country: 'Singapore',
    visaName: 'Singapore eVisa Tourist',
    entryType: 'Multiple Entry',
    validity: '90 Days',
    stayPeriod: '30 Days per visit',
    processingTime: '3 Working Days',
    customerSellingPrice: 38000,
    currency: 'LKR',
    status: 'Active',
    lastUpdated: '2026-08-12',
    governmentFee: 22000,
    supplierCost: 4000,
    otherCost: 1500,
    arsServiceCharge: 10500,
    estimatedProfit: 10500
  },
  {
    id: 'evisa-3',
    country: 'Azerbaijan',
    visaName: 'ASAN e-Visa Standard',
    entryType: 'Single Entry',
    validity: '90 Days',
    stayPeriod: '30 Days',
    processingTime: '3 - 5 Working Days',
    customerSellingPrice: 25000,
    currency: 'LKR',
    status: 'Active',
    lastUpdated: '2026-08-01',
    governmentFee: 14000,
    supplierCost: 3000,
    otherCost: 1000,
    arsServiceCharge: 7000,
    estimatedProfit: 7000
  }
];

export const MOCK_PRICES: MasterPriceItem[] = [
  {
    id: 'pr-1',
    serviceName: 'Tourist Visa Processing Fee',
    category: 'Visa Services',
    sellingPrice: 75000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 25000,
    serviceCharge: 50000,
    profit: 50000
  },
  {
    id: 'pr-2',
    serviceName: 'Student Visa File Preparation & Consultation',
    category: 'Visa Services',
    sellingPrice: 150000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 40000,
    serviceCharge: 110000,
    profit: 110000
  },
  {
    id: 'pr-3',
    serviceName: 'VFS Appointment Booking Support',
    category: 'Additional Services',
    sellingPrice: 15000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 5000,
    serviceCharge: 10000,
    profit: 10000
  },
  {
    id: 'pr-4',
    serviceName: 'Cover Letter & SOP Drafting',
    category: 'Additional Services',
    sellingPrice: 20000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 5000,
    serviceCharge: 15000,
    profit: 15000
  },
  {
    id: 'pr-5',
    serviceName: 'Travel Insurance Premium Policy (30 Days)',
    category: 'Additional Services',
    sellingPrice: 25000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 15000,
    serviceCharge: 10000,
    profit: 10000
  },
  {
    id: 'pr-6',
    serviceName: 'Confirmed Hotel Reservation for Visa',
    category: 'Additional Services',
    sellingPrice: 12000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 4000,
    serviceCharge: 8000,
    profit: 8000
  },
  {
    id: 'pr-7',
    serviceName: 'Flight Itinerary Reservation',
    category: 'Additional Services',
    sellingPrice: 10000,
    currency: 'LKR',
    status: 'Active',
    costPrice: 3000,
    serviceCharge: 7000,
    profit: 7000
  }
];

export const MOCK_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-1',
    packageId: 'PKG-FRA-01',
    packageName: 'France Schengen All-Inclusive Tourist Package',
    country: 'France',
    visaType: 'Tourist Visa',
    servicesIncluded: [
      'Tourist Visa Processing Fee',
      'VFS Appointment Booking Support',
      'Cover Letter & SOP Drafting',
      'Travel Insurance Premium Policy (30 Days)',
      'Confirmed Hotel Reservation for Visa',
      'Flight Itinerary Reservation'
    ],
    normalTotal: 157000,
    packagePrice: 135000,
    discount: 22000,
    finalPrice: 135000,
    status: 'Active',
    discountReason: 'Summer Promotional Discount',
    internalCost: 57000,
    estimatedProfit: 78000
  },
  {
    id: 'pkg-2',
    packageId: 'PKG-UK-STU',
    packageName: 'UK Tier 4 Student Express Complete Package',
    country: 'United Kingdom',
    visaType: 'Student Visa',
    servicesIncluded: [
      'Student Visa File Preparation & Consultation',
      'Cover Letter & SOP Drafting',
      'VFS Appointment Booking Support',
      'Travel Insurance Premium Policy (30 Days)'
    ],
    normalTotal: 210000,
    packagePrice: 185000,
    discount: 25000,
    finalPrice: 185000,
    status: 'Active',
    discountReason: 'Early Bird Student Special',
    internalCost: 65000,
    estimatedProfit: 120000
  }
];

export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'quo-1',
    quotationNumber: 'QUO-2026-089',
    customerId: 'cust-2',
    customerName: 'Sanduni De Silva',
    country: 'France',
    visaType: 'Tourist Visa',
    services: [
      { serviceName: 'Tourist Visa Processing Fee', price: 75000 },
      { serviceName: 'VFS Appointment Booking Support', price: 15000 },
      { serviceName: 'Cover Letter & SOP Drafting', price: 20000 },
      { serviceName: 'Travel Insurance Premium Policy (30 Days)', price: 25000 }
    ],
    packageName: 'France Schengen All-Inclusive Tourist Package',
    subtotal: 157000,
    discount: 22000,
    total: 135000,
    validityDate: '2026-08-30',
    paymentTerms: '50% advance upon registration, 50% prior to VFS submission.',
    termsAndConditions: 'All government fees subject to exchange rate fluctuations.',
    status: 'Accepted',
    createdAt: '2026-07-28'
  },
  {
    id: 'quo-2',
    quotationNumber: 'QUO-2026-090',
    customerId: 'cust-1',
    customerName: 'Dilshan Mendis',
    country: 'Canada',
    visaType: 'Tourist Visa',
    services: [
      { serviceName: 'Tourist Visa Processing Fee', price: 75000 },
      { serviceName: 'Cover Letter & SOP Drafting', price: 20000 }
    ],
    subtotal: 95000,
    discount: 5000,
    total: 90000,
    validityDate: '2026-08-25',
    paymentTerms: 'Full advance payment required.',
    termsAndConditions: 'Embassy decision is final. ARS service fees are non-refundable.',
    status: 'Sent',
    createdAt: '2026-08-12'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0501',
    customerId: 'cust-2',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002',
    items: [
      { description: 'France Schengen All-Inclusive Tourist Package', amount: 135000 }
    ],
    total: 135000,
    paid: 70000,
    balance: 65000,
    dueDate: '2026-08-21',
    status: 'Part Paid',
    createdAt: '2026-07-28'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0502',
    customerId: 'cust-3',
    customerName: 'Kamal Gunaratne',
    caseId: 'CAS-9003',
    items: [
      { description: 'UK Tier 4 Student Express Package', amount: 185000 }
    ],
    total: 185000,
    paid: 185000,
    balance: 0,
    dueDate: '2026-08-01',
    status: 'Paid',
    createdAt: '2026-07-15'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0503',
    customerId: 'cust-1',
    customerName: 'Dilshan Mendis',
    caseId: 'CAS-9001',
    items: [
      { description: 'UAE 30 Days Express e-Visa Service', amount: 45000 }
    ],
    total: 45000,
    paid: 0,
    balance: 45000,
    dueDate: '2026-08-14',
    status: 'Overdue',
    createdAt: '2026-08-10'
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pmt-1',
    paymentId: 'PMT-8801',
    invoiceNumber: 'INV-2026-0501',
    customerId: 'cust-2',
    customerName: 'Sanduni De Silva',
    amount: 70000,
    date: '2026-07-28',
    type: 'Advance',
    method: 'Bank Transfer',
    receivedBy: 'Nimali Fernando',
    account: 'Commercial Bank - 1000234891',
    bankReference: 'TXN-99887711',
    notes: 'Advance 50% payment for France Package.',
    status: 'Completed'
  },
  {
    id: 'pmt-2',
    paymentId: 'PMT-8802',
    invoiceNumber: 'INV-2026-0502',
    customerId: 'cust-3',
    customerName: 'Kamal Gunaratne',
    amount: 185000,
    date: '2026-07-15',
    type: 'Full Payment',
    method: 'Cash',
    receivedBy: 'Thenushan Sritharan',
    account: 'Cash in Hand',
    notes: 'Full payment collected at head office.',
    status: 'Completed'
  }
];

export const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'rcp-1',
    receiptNumber: 'REC-2026-101',
    paymentId: 'PMT-8801',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002',
    country: 'France',
    visaType: 'Tourist Visa',
    amountReceived: 70000,
    paymentFor: 'Advance payment for France Schengen Visa Package',
    paymentMethod: 'Bank Transfer',
    remainingBalance: 65000,
    date: '2026-07-28',
    receivedBy: 'Nimali Fernando'
  },
  {
    id: 'rcp-2',
    receiptNumber: 'REC-2026-102',
    paymentId: 'PMT-8802',
    customerName: 'Kamal Gunaratne',
    caseId: 'CAS-9003',
    country: 'United Kingdom',
    visaType: 'Student Visa',
    amountReceived: 185000,
    paymentFor: 'Full payment for UK Tier 4 Student Visa Package',
    paymentMethod: 'Cash',
    remainingBalance: 0,
    date: '2026-07-15',
    receivedBy: 'Thenushan Sritharan'
  }
];

export const MOCK_INCOME: Income[] = [
  {
    id: 'inc-1',
    transactionId: 'INC-7001',
    date: '2026-08-15',
    customerName: 'Kamal Gunaratne',
    caseId: 'CAS-9003',
    category: 'Student Service Income',
    amount: 185000,
    paymentMethod: 'Cash',
    account: 'Cash in Hand',
    source: 'Direct Client Registration'
  },
  {
    id: 'inc-2',
    transactionId: 'INC-7002',
    date: '2026-08-10',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002',
    category: 'Tourist Visa Income',
    amount: 70000,
    paymentMethod: 'Bank Transfer',
    account: 'Commercial Bank - 1000234891',
    source: 'Website Lead'
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expenseId: 'EXP-4001',
    category: 'Visa Operations',
    subcategory: 'Embassy/VFS Charges',
    description: 'VFS France Visa Application Fee & Biometric Service Charge',
    supplier: 'VFS Global Lanka',
    amount: 32000,
    date: '2026-08-14',
    paymentMethod: 'Bank Transfer',
    paidFrom: 'Commercial Bank - 1000234891',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002',
    notes: 'Paid via online VFS portal'
  },
  {
    id: 'exp-2',
    expenseId: 'EXP-4002',
    category: 'Marketing',
    subcategory: 'Facebook Ads',
    description: 'Meta Ads Campaign - France & UK Student Visas',
    supplier: 'Meta Platforms Inc',
    amount: 45000,
    date: '2026-08-12',
    paymentMethod: 'Card',
    paidFrom: 'Sampath Bank Credit Card',
    notes: 'August lead gen campaign'
  },
  {
    id: 'exp-3',
    expenseId: 'EXP-4003',
    category: 'Office',
    subcategory: 'Electricity',
    description: 'Monthly Head Office Electricity Bill',
    supplier: 'CEB',
    amount: 28500,
    date: '2026-08-05',
    paymentMethod: 'Bank Transfer',
    paidFrom: 'Commercial Bank - 1000234891'
  }
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    accountName: 'Cash in Hand',
    type: 'Cash',
    currentBalance: 425000,
    currency: 'LKR',
    lastUpdated: '2026-08-17'
  },
  {
    id: 'acc-2',
    accountName: 'Commercial Bank - Operating Account',
    accountNumber: '1000234891',
    bankName: 'Commercial Bank PLC',
    type: 'Bank',
    currentBalance: 3850000,
    currency: 'LKR',
    lastUpdated: '2026-08-17'
  },
  {
    id: 'acc-3',
    accountName: 'Sampath Bank - Treasury Account',
    accountNumber: '002910004561',
    bankName: 'Sampath Bank PLC',
    type: 'Bank',
    currentBalance: 8200000,
    currency: 'LKR',
    lastUpdated: '2026-08-17'
  },
  {
    id: 'acc-4',
    accountName: 'Online Merchant Card Gateway',
    type: 'Card/Online',
    currentBalance: 610000,
    currency: 'LKR',
    lastUpdated: '2026-08-17'
  }
];

export const MOCK_TRANSFERS: AccountTransfer[] = [
  {
    id: 'trf-1',
    fromAccount: 'Cash in Hand',
    toAccount: 'Commercial Bank - Operating Account',
    amount: 200000,
    date: '2026-08-15',
    reference: 'DEP-20260815',
    notes: 'Cash deposit to bank'
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    supplierName: 'VFS Global Lanka',
    company: 'VFS Services Pvt Ltd',
    country: 'Sri Lanka',
    phone: '+94 11 235 0000',
    whatsApp: '+94 77 100 2000',
    services: ['VFS Slot Booking', 'Biometric Appointment'],
    casesHandled: 45,
    status: 'Active',
    amountPaid: 850000,
    amountPayable: 64000
  },
  {
    id: 'sup-2',
    supplierName: 'Gulf Express Travel & eVisa Agency',
    company: 'Gulf Express Travels FZE',
    country: 'United Arab Emirates',
    phone: '+971 4 333 8899',
    whatsApp: '+971 50 123 9988',
    services: ['UAE eVisa Processing', 'Flight Reservations'],
    casesHandled: 120,
    status: 'Active',
    amountPaid: 2400000,
    amountPayable: 150000
  }
];

export const MOCK_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    staffId: 'STF-001',
    name: 'Thenushan Sritharan',
    role: 'Super Admin',
    branch: 'Colombo Head Office',
    phone: '+94 77 123 4567',
    email: 'admin@arsvisa.com',
    status: 'Active',
    joinedDate: '2024-01-01'
  },
  {
    id: 'staff-2',
    staffId: 'STF-002',
    name: 'Saman Jayasinghe',
    role: 'Visa Consultant',
    branch: 'Colombo Head Office',
    phone: '+94 71 555 6677',
    email: 'saman@arsvisa.com',
    status: 'Active',
    joinedDate: '2024-06-15'
  },
  {
    id: 'staff-3',
    staffId: 'STF-003',
    name: 'Nimali Fernando',
    role: 'Visa Consultant',
    branch: 'Kandy Branch',
    phone: '+94 77 888 9911',
    email: 'nimali@arsvisa.com',
    status: 'Active',
    joinedDate: '2025-02-01'
  },
  {
    id: 'staff-4',
    staffId: 'STF-004',
    name: 'Ruwan Kumara',
    role: 'Accountant',
    branch: 'Colombo Head Office',
    phone: '+94 70 222 3344',
    email: 'ruwan@arsvisa.com',
    status: 'Active',
    joinedDate: '2024-09-10'
  }
];

export const MOCK_STAFF_PERFORMANCE: StaffPerformance[] = [
  {
    staffId: 'STF-002',
    name: 'Saman Jayasinghe',
    leadsHandled: 48,
    callsCount: 135,
    whatsAppCount: 240,
    registrations: 18,
    appointments: 22,
    visaCases: 16,
    paymentsCollected: 2150000,
    conversionRate: 37.5,
    pendingFollowups: 5
  },
  {
    staffId: 'STF-003',
    name: 'Nimali Fernando',
    leadsHandled: 52,
    callsCount: 160,
    whatsAppCount: 310,
    registrations: 21,
    appointments: 25,
    visaCases: 19,
    paymentsCollected: 2890000,
    conversionRate: 40.3,
    pendingFollowups: 3
  }
];

export const MOCK_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Call Kavinda Perera regarding France Schengen checklist',
    type: 'Call Customer',
    status: 'Pending',
    priority: 'High',
    assignedTo: 'Saman Jayasinghe',
    dueDate: '2026-08-18',
    customerName: 'Kavinda Perera'
  },
  {
    id: 'tsk-2',
    title: 'Collect bank statement from Sanduni De Silva for VFS appointment',
    type: 'Collect Documents',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Nimali Fernando',
    dueDate: '2026-08-19',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002'
  },
  {
    id: 'tsk-3',
    title: 'Follow up with Gulf Express regarding Dilshan UAE eVisa status',
    type: 'Agent Follow-up',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Saman Jayasinghe',
    dueDate: '2026-08-17',
    customerName: 'Dilshan Mendis',
    caseId: 'CAS-9001'
  }
];

export const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt-1',
    title: 'France Schengen VFS Submission & Biometrics',
    customerName: 'Sanduni De Silva',
    phone: '+94 77 444 3322',
    type: 'VFS Appointment',
    date: '2026-08-22',
    time: '09:30 AM',
    location: 'VFS Global, Access Tower 2, Colombo 02',
    consultant: 'Nimali Fernando',
    status: 'Scheduled',
    notes: 'Bring original passport and all verified documents.'
  },
  {
    id: 'apt-2',
    title: 'Canada Visa Consultation & Profile Review',
    customerName: 'Rohan Wickramasinghe',
    phone: '+94 70 333 4455',
    type: 'Office Appointment',
    date: '2026-08-19',
    time: '02:00 PM',
    location: 'ARS Head Office, Colombo',
    consultant: 'Saman Jayasinghe',
    status: 'Scheduled',
    notes: 'Review LMIA approval letter and employment certificates.'
  }
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    fileName: 'Sanduni_Passport_Original_Scan.pdf',
    documentType: 'Passport',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002',
    status: 'Verified',
    uploadedDate: '2026-07-29',
    uploadedBy: 'Nimali Fernando',
    verifiedBy: 'Thenushan Sritharan'
  },
  {
    id: 'doc-2',
    fileName: 'Sanduni_Commercial_Bank_Statement_6M.pdf',
    documentType: 'Bank Statement',
    customerName: 'Sanduni De Silva',
    caseId: 'CAS-9002',
    status: 'Received',
    uploadedDate: '2026-08-15',
    uploadedBy: 'Sanduni De Silva'
  },
  {
    id: 'doc-3',
    fileName: 'Dilshan_Passport_Copy.pdf',
    documentType: 'Passport',
    customerName: 'Dilshan Mendis',
    caseId: 'CAS-9001',
    status: 'Verified',
    uploadedDate: '2026-08-10',
    uploadedBy: 'Saman Jayasinghe',
    verifiedBy: 'Saman Jayasinghe'
  }
];
