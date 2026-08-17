import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive, ArchiveRestore, Briefcase, CalendarClock, FileSpreadsheet, FileText, History, Pencil, ReceiptText, UserRound, Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Tabs } from '@/components/common/Tabs'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ConfirmationDialog } from '@/components/modals/ConfirmationDialog'
import { useToast } from '@/hooks/useToast'
import { PERMISSIONS } from '@/constants/permissions'
import { ROUTES } from '@/constants/routes'
import { customersApi } from '../api/customersApi'
import { CustomerFormModal } from '../components/CustomerFormModal'
import { OverviewTab } from '../components/OverviewTab'
import { ActivityTab } from '../components/ActivityTab'
import { TabComingSoon } from '../components/TabComingSoon'
import { CUSTOMER_STATUS, CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_TONE } from '../constants'

const TABS = [
  { key: 'overview', label: 'Overview', icon: UserRound },
  { key: 'cases', label: 'Visa Cases', icon: Briefcase },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'payments', label: 'Payments', icon: Wallet },
  { key: 'appointments', label: 'Appointments', icon: CalendarClock },
  { key: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
  { key: 'invoices', label: 'Invoices', icon: ReceiptText },
  { key: 'activity', label: 'Activity', icon: History },
]

export default function CustomerProfilePage() {
  const { customerId } = useParams()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(false)

  const { data: customer, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => customersApi.getById(customerId),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  const updateMutation = useMutation({
    mutationFn: (payload) => customersApi.update(customerId, payload),
    onSuccess: () => {
      toast.success('Customer updated successfully')
      setIsEditOpen(false)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not update customer'),
  })

  const archiveMutation = useMutation({
    mutationFn: () => customersApi.archive(customerId),
    onSuccess: () => {
      toast.success('Customer archived')
      setConfirmArchive(false)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not archive customer'),
  })

  const restoreMutation = useMutation({
    mutationFn: () => customersApi.restore(customerId),
    onSuccess: () => {
      toast.success('Customer restored')
      setConfirmRestore(false)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not restore customer'),
  })

  if (isLoading) {
    return <LoadingSkeleton rows={8} className="h-6" />
  }

  if (isError || !customer) {
    return (
      <ErrorState
        title="Couldn't load this customer"
        description={error?.response?.data?.message ?? error?.message}
        onRetry={refetch}
      />
    )
  }

  const isArchived = customer.status === CUSTOMER_STATUS.ARCHIVED

  return (
    <div>
      <PageHeader
        title={customer.fullName}
        description={customer.customerId}
        breadcrumbItems={[{ label: 'Customers', to: ROUTES.CUSTOMERS }, { label: customer.customerId }]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={customer.status} tone={CUSTOMER_STATUS_TONE[customer.status]} label={CUSTOMER_STATUS_LABELS[customer.status]} />
            <PermissionGuard permission={PERMISSIONS.CUSTOMERS_MANAGE}>
              <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
                <Pencil className="size-4" /> Edit
              </Button>
              {isArchived ? (
                <Button variant="secondary" onClick={() => setConfirmRestore(true)}>
                  <ArchiveRestore className="size-4" /> Restore
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setConfirmArchive(true)}>
                  <Archive className="size-4" /> Archive
                </Button>
              )}
            </PermissionGuard>
          </div>
        }
      />

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'overview' && <OverviewTab customer={customer} />}
        {activeTab === 'cases' && <TabComingSoon label="Visa Cases" phase="Phase 3" />}
        {activeTab === 'documents' && <TabComingSoon label="Documents" phase="Phase 3" />}
        {activeTab === 'payments' && <TabComingSoon label="Payments" phase="Phase 5" />}
        {activeTab === 'appointments' && <TabComingSoon label="Appointments" phase="Phase 2" />}
        {activeTab === 'quotations' && <TabComingSoon label="Quotations" phase="Phase 4" />}
        {activeTab === 'invoices' && <TabComingSoon label="Invoices" phase="Phase 5" />}
        {activeTab === 'activity' && <ActivityTab customerId={customer.id} />}
      </div>

      <CustomerFormModal
        isOpen={isEditOpen}
        mode="edit"
        customer={customer}
        onClose={() => setIsEditOpen(false)}
        isSubmitting={updateMutation.isPending}
        onSubmit={(payload) => updateMutation.mutate(payload)}
      />

      <ConfirmationDialog
        isOpen={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={() => archiveMutation.mutate()}
        title="Archive customer?"
        description={`${customer.fullName} will be archived and hidden from active customer lists. This can be undone later.`}
        confirmLabel="Archive"
        tone="danger"
        isLoading={archiveMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        onConfirm={() => restoreMutation.mutate()}
        title="Restore customer?"
        description={`${customer.fullName} will be marked active again.`}
        confirmLabel="Restore"
        isLoading={restoreMutation.isPending}
      />
    </div>
  )
}
