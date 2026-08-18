import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import LeadsPage from '../features/leads/LeadsPage';
import CustomersPage from '../features/customers/CustomersPage';
import VisaCasesPage from '../features/visaCases/VisaCasesPage';
import EVisaPage from '../features/eVisa/EVisaPage';
import DocumentsPage from '../features/documents/DocumentsPage';
import TasksPage from '../features/tasks/TasksPage';
import AppointmentsPage from '../features/appointments/AppointmentsPage';
import PricingPage from '../features/pricing/PricingPage';
import PackagesPage from '../features/packages/PackagesPage';
import QuotationsPage from '../features/quotations/QuotationsPage';
import InvoicesPage from '../features/invoices/InvoicesPage';
import PaymentsPage from '../features/payments/PaymentsPage';
import ReceiptsPage from '../features/receipts/ReceiptsPage';
import OutstandingPage from '../features/invoices/OutstandingPage';
import IncomePage from '../features/income/IncomePage';
import ExpensesPage from '../features/expenses/ExpensesPage';
import BankingPage from '../features/banking/BankingPage';
import SuppliersPage from '../features/suppliers/SuppliersPage';
import StaffPage from '../features/staff/StaffPage';
import ReportsPage from '../features/reports/ReportsPage';
import SettingsPage from '../features/settings/SettingsPage';
import RolesPermissionsPage from '../features/permissions/RolesPermissionsPage';
import PermissionGuard from '../components/common/PermissionGuard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route path="leads" element={
          <PermissionGuard permission="lead.view" fallback={<Navigate to="/dashboard" />}>
            <LeadsPage />
          </PermissionGuard>
        } />

        <Route path="customers" element={
          <PermissionGuard permission="customer.view" fallback={<Navigate to="/dashboard" />}>
            <CustomersPage />
          </PermissionGuard>
        } />

        <Route path="visa-cases" element={
          <PermissionGuard permission="visa.view" fallback={<Navigate to="/dashboard" />}>
            <VisaCasesPage />
          </PermissionGuard>
        } />

        <Route path="evisa" element={
          <PermissionGuard permission="evisa.view" fallback={<Navigate to="/dashboard" />}>
            <EVisaPage />
          </PermissionGuard>
        } />

        <Route path="documents" element={<DocumentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />

        <Route path="pricing" element={
          <PermissionGuard permission="pricing.view" fallback={<Navigate to="/dashboard" />}>
            <PricingPage />
          </PermissionGuard>
        } />

        <Route path="packages" element={
          <PermissionGuard permission="package.view" fallback={<Navigate to="/dashboard" />}>
            <PackagesPage />
          </PermissionGuard>
        } />

        <Route path="quotations" element={
          <PermissionGuard permission="quotation.view" fallback={<Navigate to="/dashboard" />}>
            <QuotationsPage />
          </PermissionGuard>
        } />

        <Route path="invoices" element={
          <PermissionGuard permission="invoice.view" fallback={<Navigate to="/dashboard" />}>
            <InvoicesPage />
          </PermissionGuard>
        } />

        <Route path="payments" element={
          <PermissionGuard permission="payment.view" fallback={<Navigate to="/dashboard" />}>
            <PaymentsPage />
          </PermissionGuard>
        } />

        <Route path="receipts" element={
          <PermissionGuard permission="payment.view" fallback={<Navigate to="/dashboard" />}>
            <ReceiptsPage />
          </PermissionGuard>
        } />

        <Route path="outstanding" element={
          <PermissionGuard permission="invoice.view" fallback={<Navigate to="/dashboard" />}>
            <OutstandingPage />
          </PermissionGuard>
        } />

        <Route path="income" element={
          <PermissionGuard permission="finance.income.view" fallback={<Navigate to="/dashboard" />}>
            <IncomePage />
          </PermissionGuard>
        } />

        <Route path="expenses" element={
          <PermissionGuard permission="finance.expense.view" fallback={<Navigate to="/dashboard" />}>
            <ExpensesPage />
          </PermissionGuard>
        } />

        <Route path="banking" element={
          <PermissionGuard permission="finance.banking.view" fallback={<Navigate to="/dashboard" />}>
            <BankingPage />
          </PermissionGuard>
        } />

        <Route path="suppliers" element={
          <PermissionGuard permission="supplier.view" fallback={<Navigate to="/dashboard" />}>
            <SuppliersPage />
          </PermissionGuard>
        } />

        <Route path="staff" element={
          <PermissionGuard permission="staff.manage" fallback={<Navigate to="/dashboard" />}>
            <StaffPage />
          </PermissionGuard>
        } />

        <Route path="reports" element={
          <PermissionGuard permission="reports.view" fallback={<Navigate to="/dashboard" />}>
            <ReportsPage />
          </PermissionGuard>
        } />

        <Route path="settings" element={
          <PermissionGuard permission="settings.manage" fallback={<Navigate to="/dashboard" />}>
            <SettingsPage />
          </PermissionGuard>
        } />

        <Route path="roles-permissions" element={
          <PermissionGuard permission="settings.manage" fallback={<Navigate to="/dashboard" />}>
            <RolesPermissionsPage />
          </PermissionGuard>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
