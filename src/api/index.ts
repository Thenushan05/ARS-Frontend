import axiosInstance from './axiosInstance';
import { 
  CURRENT_USER_MOCK, MOCK_LEADS, MOCK_CUSTOMERS, MOCK_VISA_CASES, 
  MOCK_EVISAS, MOCK_PRICES, MOCK_PACKAGES, MOCK_QUOTATIONS, MOCK_INVOICES, 
  MOCK_PAYMENTS, MOCK_RECEIPTS, MOCK_INCOME, MOCK_EXPENSES, MOCK_BANK_ACCOUNTS, 
  MOCK_TRANSFERS, MOCK_SUPPLIERS, MOCK_STAFF, MOCK_STAFF_PERFORMANCE, 
  MOCK_TASKS, MOCK_APPOINTMENTS, MOCK_DOCUMENTS 
} from './mockData';
import { 
  User, Lead, Customer, VisaCase, EVisaService, MasterPriceItem, 
  PackageItem, Quotation, Invoice, Payment, Receipt, Income, Expense, 
  BankAccount, AccountTransfer, Supplier, StaffMember, StaffPerformance, 
  TaskItem, AppointmentItem, DocumentItem, PaginatedResponse, FilterParams 
} from '../types';

// Generic helper to simulate API call delay when fallback to mock data occurs
const mockDelay = <T>(data: T, delay = 200): Promise<T> => 
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// AUTH API
export const authApi = {
  login: async (email: string, pass: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password: pass });
      return res.data;
    } catch {
      // Mock Fallback
      if (email === 'consultant@arsvisa.com') {
        const consultantUser: User = {
          ...CURRENT_USER_MOCK,
          id: 'staff-2',
          name: 'Saman Jayasinghe',
          email: 'consultant@arsvisa.com',
          role: 'Visa Consultant',
          permissions: [
            'lead.view', 'lead.create', 'lead.edit',
            'customer.view', 'customer.create',
            'visa.view', 'visa.create', 'visa.update',
            'quotation.view', 'quotation.create',
            'invoice.view', 'payment.view'
          ]
        };
        return mockDelay({ token: 'mock-jwt-token-consultant', user: consultantUser });
      }
      return mockDelay({ token: 'mock-jwt-token-admin', user: CURRENT_USER_MOCK });
    }
  },
  getMe: async (): Promise<User> => {
    try {
      const res = await axiosInstance.get('/auth/me');
      return res.data;
    } catch {
      const stored = localStorage.getItem('ars_user');
      return mockDelay(stored ? JSON.parse(stored) : CURRENT_USER_MOCK);
    }
  }
};

// LEADS API
let leadsStore = [...MOCK_LEADS];
export const leadsApi = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<Lead>> => {
    try {
      const res = await axiosInstance.get('/leads', { params });
      return res.data;
    } catch {
      let filtered = [...leadsStore];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.country.toLowerCase().includes(q));
      }
      if (params?.status) {
        filtered = filtered.filter(l => l.status === params.status);
      }
      return mockDelay({
        data: filtered,
        total: filtered.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: Math.ceil(filtered.length / (params?.pageSize || 10))
      });
    }
  },
  create: async (lead: Partial<Lead>): Promise<Lead> => {
    try {
      const res = await axiosInstance.post('/leads', lead);
      return res.data;
    } catch {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        leadId: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: lead.name || 'New Lead',
        phone: lead.phone || '',
        email: lead.email,
        country: lead.country || 'France',
        visaType: lead.visaType || 'Tourist Visa',
        source: lead.source || 'Website',
        assignedStaff: lead.assignedStaff || 'Saman Jayasinghe',
        status: lead.status || 'New Lead',
        notes: lead.notes,
        followUpDate: lead.followUpDate,
        createdAt: new Date().toISOString().split('T')[0]
      };
      leadsStore.unshift(newLead);
      return mockDelay(newLead);
    }
  },
  update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    try {
      const res = await axiosInstance.patch(`/leads/${id}`, updates);
      return res.data;
    } catch {
      const index = leadsStore.findIndex(l => l.id === id);
      if (index !== -1) {
        leadsStore[index] = { ...leadsStore[index], ...updates };
        return mockDelay(leadsStore[index]);
      }
      throw new Error('Lead not found');
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/leads/${id}`);
    } catch {
      leadsStore = leadsStore.filter(l => l.id !== id);
    }
  }
};

// CUSTOMERS API
let customersStore = [...MOCK_CUSTOMERS];
export const customersApi = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<Customer>> => {
    try {
      const res = await axiosInstance.get('/customers', { params });
      return res.data;
    } catch {
      let filtered = [...customersStore];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.passportNumber.toLowerCase().includes(q) || 
          c.customerId.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.nic && c.nic.toLowerCase().includes(q))
        );
      }
      return mockDelay({
        data: filtered,
        total: filtered.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: Math.ceil(filtered.length / (params?.pageSize || 10))
      });
    }
  },
  create: async (customerData: Partial<Customer>): Promise<{ customer: Customer; isExisting: boolean; newCaseId?: string }> => {
    try {
      const res = await axiosInstance.post('/customers', customerData);
      return res.data;
    } catch {
      // Check if existing customer matches passport or NIC
      const existing = customersStore.find(c => 
        (customerData.passportNumber && c.passportNumber.toLowerCase() === customerData.passportNumber.toLowerCase()) ||
        (customerData.nic && c.nic && c.nic.toLowerCase() === customerData.nic.toLowerCase())
      );

      if (existing) {
        // Create new Visa Case under existing customer without creating duplicate customer record
        const newCaseNumber = `CAS-${Math.floor(9000 + Math.random() * 1000)}`;
        const newCase: VisaCase = {
          id: `case-${Date.now()}`,
          caseId: newCaseNumber,
          customerId: existing.id,
          customerName: existing.name,
          customerPhone: existing.phone,
          country: customerData.applyingCountry || 'France',
          visaCategory: customerData.visaCategory || 'Tourist',
          visaType: `${customerData.applyingCountry || 'France'} ${customerData.visaCategory || 'Tourist'} Visa`,
          consultant: customerData.assignedConsultant || existing.assignedConsultant || 'Saman Jayasinghe',
          status: 'New Case',
          notes: customerData.notes || 'Additional country application for existing customer.',
          createdAt: new Date().toISOString().split('T')[0]
        };
        casesStore.unshift(newCase);
        existing.activeCasesCount = (existing.activeCasesCount || 0) + 1;

        return mockDelay({
          customer: existing,
          isExisting: true,
          newCaseId: newCaseNumber
        });
      }

      // Generate ARS-2026-00001 formatted Customer ID
      const year = new Date().getFullYear();
      const count = customersStore.length + 1;
      const formattedNum = String(count).padStart(5, '0');
      const generatedCustId = `ARS-${year}-${formattedNum}`;

      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        customerId: generatedCustId,
        name: customerData.name || '',
        passportNumber: customerData.passportNumber || '',
        nic: customerData.nic,
        dateOfBirth: customerData.dateOfBirth,
        gender: customerData.gender || 'Male',
        nationality: customerData.nationality || 'Sri Lankan',
        address: customerData.address,
        phone: customerData.phone || '',
        whatsApp: customerData.whatsApp || customerData.phone || '',
        email: customerData.email || '',
        maritalStatus: customerData.maritalStatus || 'Single',
        occupation: customerData.occupation,
        monthlyIncome: customerData.monthlyIncome,
        bankBalance: customerData.bankBalance,
        applyingCountry: customerData.applyingCountry,
        visaCategory: customerData.visaCategory,
        travelPurpose: customerData.travelPurpose,
        previousVisaHistory: customerData.previousVisaHistory,
        previousRefusals: customerData.previousRefusals,
        assignedConsultant: customerData.assignedConsultant || 'Saman Jayasinghe',
        leadSource: customerData.leadSource || 'Walk-in',
        notes: customerData.notes,
        activeCasesCount: 1,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      customersStore.unshift(newCust);

      // Automatically create initial Visa Case for the new customer
      const initialCaseNumber = `CAS-${Math.floor(9000 + Math.random() * 1000)}`;
      const initialCase: VisaCase = {
        id: `case-${Date.now()}`,
        caseId: initialCaseNumber,
        customerId: newCust.id,
        customerName: newCust.name,
        customerPhone: newCust.phone,
        country: customerData.applyingCountry || 'France',
        visaCategory: customerData.visaCategory || 'Tourist',
        visaType: `${customerData.applyingCountry || 'France'} ${customerData.visaCategory || 'Tourist'} Visa`,
        consultant: newCust.assignedConsultant,
        status: 'New Case',
        notes: customerData.notes || 'Initial Visa Case created upon customer registration.',
        createdAt: new Date().toISOString().split('T')[0]
      };
      casesStore.unshift(initialCase);

      return mockDelay({
        customer: newCust,
        isExisting: false,
        newCaseId: initialCaseNumber
      });
    }
  },
  update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await axiosInstance.patch(`/customers/${id}`, updates);
      return res.data;
    } catch {
      const index = customersStore.findIndex(c => c.id === id);
      if (index !== -1) {
        customersStore[index] = { ...customersStore[index], ...updates };
        return mockDelay(customersStore[index]);
      }
      throw new Error('Customer not found');
    }
  }
};

// VISA CASES API
let casesStore = [...MOCK_VISA_CASES];
export const visaCasesApi = {
  getAll: async (params?: FilterParams): Promise<PaginatedResponse<VisaCase>> => {
    try {
      const res = await axiosInstance.get('/visa-cases', { params });
      return res.data;
    } catch {
      let filtered = [...casesStore];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(c => c.customerName.toLowerCase().includes(q) || c.caseId.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
      }
      if (params?.status) {
        filtered = filtered.filter(c => c.status === params.status);
      }
      return mockDelay({
        data: filtered,
        total: filtered.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: Math.ceil(filtered.length / (params?.pageSize || 10))
      });
    }
  },
  create: async (c: Partial<VisaCase>): Promise<VisaCase> => {
    try {
      const res = await axiosInstance.post('/visa-cases', c);
      return res.data;
    } catch {
      const newCase: VisaCase = {
        id: `case-${Date.now()}`,
        caseId: `CAS-${Math.floor(9000 + Math.random() * 1000)}`,
        customerId: c.customerId || 'cust-1',
        customerName: c.customerName || 'Dilshan Mendis',
        country: c.country || 'France',
        visaCategory: c.visaCategory || 'Tourist',
        visaType: c.visaType || 'Tourist Visa',
        consultant: c.consultant || 'Saman Jayasinghe',
        status: c.status || 'New Case',
        createdAt: new Date().toISOString().split('T')[0]
      };
      casesStore.unshift(newCase);
      return mockDelay(newCase);
    }
  },
  updateStatus: async (id: string, status: VisaCase['status'], notes?: string): Promise<VisaCase> => {
    try {
      const res = await axiosInstance.patch(`/visa-cases/${id}/status`, { status, notes });
      return res.data;
    } catch {
      const idx = casesStore.findIndex(c => c.id === id);
      if (idx !== -1) {
        casesStore[idx].status = status;
        if (notes) casesStore[idx].notes = notes;
        return mockDelay(casesStore[idx]);
      }
      throw new Error('Case not found');
    }
  }
};

// E-VISA API
let evisaStore = [...MOCK_EVISAS];
export const eVisaApi = {
  getAll: async (): Promise<EVisaService[]> => {
    try {
      const res = await axiosInstance.get('/evisa');
      return res.data;
    } catch {
      return mockDelay(evisaStore);
    }
  },
  create: async (item: Partial<EVisaService>): Promise<EVisaService> => {
    try {
      const res = await axiosInstance.post('/evisa', item);
      return res.data;
    } catch {
      const newItem: EVisaService = {
        id: `evisa-${Date.now()}`,
        country: item.country || 'Oman',
        visaName: item.visaName || 'Tourist e-Visa',
        entryType: item.entryType || 'Single Entry',
        validity: item.validity || '30 Days',
        stayPeriod: item.stayPeriod || '10 Days',
        processingTime: item.processingTime || '24 Hours',
        customerSellingPrice: item.customerSellingPrice || 30000,
        currency: 'LKR',
        status: 'Active',
        lastUpdated: new Date().toISOString().split('T')[0],
        governmentFee: item.governmentFee,
        supplierCost: item.supplierCost,
        arsServiceCharge: item.arsServiceCharge,
        estimatedProfit: item.estimatedProfit
      };
      evisaStore.unshift(newItem);
      return mockDelay(newItem);
    }
  }
};

// MASTER PRICE LIST API
let priceStore = [...MOCK_PRICES];
export const pricingApi = {
  getAll: async (): Promise<MasterPriceItem[]> => {
    try {
      const res = await axiosInstance.get('/pricing');
      return res.data;
    } catch {
      return mockDelay(priceStore);
    }
  },
  create: async (item: Partial<MasterPriceItem>): Promise<MasterPriceItem> => {
    try {
      const res = await axiosInstance.post('/pricing', item);
      return res.data;
    } catch {
      const newItem: MasterPriceItem = {
        id: `pr-${Date.now()}`,
        serviceName: item.serviceName || 'New Service',
        category: item.category || 'Visa Services',
        sellingPrice: item.sellingPrice || 10000,
        currency: 'LKR',
        status: 'Active',
        costPrice: item.costPrice,
        serviceCharge: item.serviceCharge,
        profit: item.profit
      };
      priceStore.unshift(newItem);
      return mockDelay(newItem);
    }
  }
};

// PACKAGES API
let packageStore = [...MOCK_PACKAGES];
export const packagesApi = {
  getAll: async (): Promise<PackageItem[]> => {
    try {
      const res = await axiosInstance.get('/packages');
      return res.data;
    } catch {
      return mockDelay(packageStore);
    }
  },
  create: async (pkg: Partial<PackageItem>): Promise<PackageItem> => {
    try {
      const res = await axiosInstance.post('/packages', pkg);
      return res.data;
    } catch {
      const newPkg: PackageItem = {
        id: `pkg-${Date.now()}`,
        packageId: `PKG-${Date.now().toString().slice(-4)}`,
        packageName: pkg.packageName || 'New Custom Package',
        country: pkg.country || 'Germany',
        visaType: pkg.visaType || 'Tourist Visa',
        servicesIncluded: pkg.servicesIncluded || [],
        normalTotal: pkg.normalTotal || 100000,
        packagePrice: pkg.packagePrice || 85000,
        discount: pkg.discount || 15000,
        finalPrice: pkg.finalPrice || 85000,
        status: 'Active',
        discountReason: pkg.discountReason,
        internalCost: pkg.internalCost,
        estimatedProfit: pkg.estimatedProfit
      };
      packageStore.unshift(newPkg);
      return mockDelay(newPkg);
    }
  }
};

// QUOTATIONS API
let quotationStore = [...MOCK_QUOTATIONS];
export const quotationsApi = {
  getAll: async (): Promise<Quotation[]> => {
    try {
      const res = await axiosInstance.get('/quotations');
      return res.data;
    } catch {
      return mockDelay(quotationStore);
    }
  },
  create: async (q: Partial<Quotation>): Promise<Quotation> => {
    try {
      const res = await axiosInstance.post('/quotations', q);
      return res.data;
    } catch {
      const newQuo: Quotation = {
        id: `quo-${Date.now()}`,
        quotationNumber: `QUO-2026-${Math.floor(100 + Math.random() * 900)}`,
        customerId: q.customerId || 'cust-1',
        customerName: q.customerName || 'Dilshan Mendis',
        country: q.country || 'France',
        visaType: q.visaType || 'Tourist Visa',
        services: q.services || [],
        packageName: q.packageName,
        subtotal: q.subtotal || 100000,
        discount: q.discount || 0,
        total: q.total || 100000,
        validityDate: q.validityDate || '2026-08-31',
        paymentTerms: q.paymentTerms || 'Standard Terms',
        termsAndConditions: q.termsAndConditions || 'Standard T&C',
        status: 'Draft',
        createdAt: new Date().toISOString().split('T')[0]
      };
      quotationStore.unshift(newQuo);
      return mockDelay(newQuo);
    }
  }
};

// INVOICES API
let invoiceStore = [...MOCK_INVOICES];
export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    try {
      const res = await axiosInstance.get('/invoices');
      return res.data;
    } catch {
      return mockDelay(invoiceStore);
    }
  },
  create: async (inv: Partial<Invoice>): Promise<Invoice> => {
    try {
      const res = await axiosInstance.post('/invoices', inv);
      return res.data;
    } catch {
      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2026-${Math.floor(500 + Math.random() * 500)}`,
        customerId: inv.customerId || 'cust-1',
        customerName: inv.customerName || 'Dilshan Mendis',
        caseId: inv.caseId,
        items: inv.items || [{ description: 'Visa Service', amount: 50000 }],
        total: inv.total || 50000,
        paid: 0,
        balance: inv.total || 50000,
        dueDate: inv.dueDate || '2026-08-30',
        status: 'Unpaid',
        createdAt: new Date().toISOString().split('T')[0]
      };
      invoiceStore.unshift(newInv);
      return mockDelay(newInv);
    }
  }
};

// PAYMENTS API
let paymentStore = [...MOCK_PAYMENTS];
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const res = await axiosInstance.get('/payments');
      return res.data;
    } catch {
      return mockDelay(paymentStore);
    }
  },
  create: async (pmt: Partial<Payment>): Promise<{ payment: Payment; receipt: Receipt }> => {
    try {
      const res = await axiosInstance.post('/payments', pmt);
      return res.data;
    } catch {
      const newPmt: Payment = {
        id: `pmt-${Date.now()}`,
        paymentId: `PMT-${Math.floor(8000 + Math.random() * 1000)}`,
        invoiceNumber: pmt.invoiceNumber || 'INV-2026-0501',
        customerId: pmt.customerId || 'cust-2',
        customerName: pmt.customerName || 'Sanduni De Silva',
        amount: pmt.amount || 20000,
        date: pmt.date || new Date().toISOString().split('T')[0],
        type: pmt.type || 'Part Payment',
        method: pmt.method || 'Cash',
        receivedBy: pmt.receivedBy || 'Thenushan Sritharan',
        account: pmt.account || 'Cash in Hand',
        notes: pmt.notes,
        status: 'Completed'
      };
      paymentStore.unshift(newPmt);

      // Create corresponding receipt
      const newReceipt: Receipt = {
        id: `rcp-${Date.now()}`,
        receiptNumber: `REC-2026-${Math.floor(200 + Math.random() * 800)}`,
        paymentId: newPmt.paymentId,
        customerName: newPmt.customerName,
        amountReceived: newPmt.amount,
        paymentFor: `Payment towards Invoice ${newPmt.invoiceNumber}`,
        paymentMethod: newPmt.method,
        remainingBalance: 0,
        date: newPmt.date,
        receivedBy: newPmt.receivedBy
      };
      receiptStore.unshift(newReceipt);

      return mockDelay({ payment: newPmt, receipt: newReceipt });
    }
  }
};

// RECEIPTS API
let receiptStore = [...MOCK_RECEIPTS];
export const receiptsApi = {
  getAll: async (): Promise<Receipt[]> => {
    try {
      const res = await axiosInstance.get('/receipts');
      return res.data;
    } catch {
      return mockDelay(receiptStore);
    }
  }
};

// INCOME API
let incomeStore = [...MOCK_INCOME];
export const incomeApi = {
  getAll: async (): Promise<Income[]> => {
    try {
      const res = await axiosInstance.get('/income');
      return res.data;
    } catch {
      return mockDelay(incomeStore);
    }
  }
};

// EXPENSES API
let expenseStore = [...MOCK_EXPENSES];
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    try {
      const res = await axiosInstance.get('/expenses');
      return res.data;
    } catch {
      return mockDelay(expenseStore);
    }
  },
  create: async (exp: Partial<Expense>): Promise<Expense> => {
    try {
      const res = await axiosInstance.post('/expenses', exp);
      return res.data;
    } catch {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        expenseId: `EXP-${Math.floor(4000 + Math.random() * 1000)}`,
        category: exp.category || 'Office',
        subcategory: exp.subcategory || 'General Maintenance',
        description: exp.description || 'Office Supplies',
        supplier: exp.supplier,
        amount: exp.amount || 5000,
        date: exp.date || new Date().toISOString().split('T')[0],
        paymentMethod: exp.paymentMethod || 'Cash',
        paidFrom: exp.paidFrom || 'Cash in Hand',
        notes: exp.notes
      };
      expenseStore.unshift(newExp);
      return mockDelay(newExp);
    }
  }
};

// BANKING API
let accountsStore = [...MOCK_BANK_ACCOUNTS];
let transfersStore = [...MOCK_TRANSFERS];
export const bankingApi = {
  getAccounts: async (): Promise<BankAccount[]> => {
    try {
      const res = await axiosInstance.get('/banking/accounts');
      return res.data;
    } catch {
      return mockDelay(accountsStore);
    }
  },
  transfer: async (t: Partial<AccountTransfer>): Promise<AccountTransfer> => {
    try {
      const res = await axiosInstance.post('/banking/transfer', t);
      return res.data;
    } catch {
      const newTrf: AccountTransfer = {
        id: `trf-${Date.now()}`,
        fromAccount: t.fromAccount || 'Cash in Hand',
        toAccount: t.toAccount || 'Commercial Bank',
        amount: t.amount || 10000,
        date: t.date || new Date().toISOString().split('T')[0],
        reference: t.reference || `REF-${Date.now()}`,
        notes: t.notes
      };
      transfersStore.unshift(newTrf);
      return mockDelay(newTrf);
    }
  }
};

// SUPPLIERS API
let supplierStore = [...MOCK_SUPPLIERS];
export const suppliersApi = {
  getAll: async (): Promise<Supplier[]> => {
    try {
      const res = await axiosInstance.get('/suppliers');
      return res.data;
    } catch {
      return mockDelay(supplierStore);
    }
  }
};

// STAFF API
let staffStore = [...MOCK_STAFF];
export const staffApi = {
  getAll: async (): Promise<StaffMember[]> => {
    try {
      const res = await axiosInstance.get('/staff');
      return res.data;
    } catch {
      return mockDelay(staffStore);
    }
  },
  getPerformance: async (): Promise<StaffPerformance[]> => {
    try {
      const res = await axiosInstance.get('/staff/performance');
      return res.data;
    } catch {
      return mockDelay(MOCK_STAFF_PERFORMANCE);
    }
  }
};

// TASKS & APPOINTMENTS & DOCUMENTS API
let tasksStore = [...MOCK_TASKS];
let aptsStore = [...MOCK_APPOINTMENTS];
let docsStore = [...MOCK_DOCUMENTS];

export const tasksApi = {
  getAll: async (): Promise<TaskItem[]> => {
    try {
      const res = await axiosInstance.get('/tasks');
      return res.data;
    } catch {
      return mockDelay(tasksStore);
    }
  },
  toggleStatus: async (id: string): Promise<TaskItem> => {
    const idx = tasksStore.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasksStore[idx].status = tasksStore[idx].status === 'Completed' ? 'Pending' : 'Completed';
      return mockDelay(tasksStore[idx]);
    }
    throw new Error('Task not found');
  }
};

export const appointmentsApi = {
  getAll: async (): Promise<AppointmentItem[]> => {
    try {
      const res = await axiosInstance.get('/appointments');
      return res.data;
    } catch {
      return mockDelay(aptsStore);
    }
  },
  create: async (apt: Partial<AppointmentItem>): Promise<AppointmentItem> => {
    const newApt: AppointmentItem = {
      id: `apt-${Date.now()}`,
      title: apt.title || 'Consultation Appointment',
      customerName: apt.customerName || 'Client Name',
      phone: apt.phone,
      type: apt.type || 'Office Appointment',
      date: apt.date || '2026-08-20',
      time: apt.time || '10:00 AM',
      location: apt.location || 'Head Office',
      consultant: apt.consultant || 'Saman Jayasinghe',
      status: 'Scheduled',
      notes: apt.notes
    };
    aptsStore.unshift(newApt);
    return mockDelay(newApt);
  }
};

export const documentsApi = {
  getAll: async (): Promise<DocumentItem[]> => {
    try {
      const res = await axiosInstance.get('/documents');
      return res.data;
    } catch {
      return mockDelay(docsStore);
    }
  }
};
