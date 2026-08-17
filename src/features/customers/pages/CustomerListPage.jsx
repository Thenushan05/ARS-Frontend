import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Archive, ArchiveRestore, Eye, Pencil, Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/tables/Pagination'
import { SearchBar } from '@/components/tables/SearchBar'
import { FilterBar } from '@/components/tables/FilterBar'
import { SelectInput } from '@/components/forms/SelectInput'
import { StaffSelector } from '@/components/common/StaffSelector'
import { ConfirmationDialog } from '@/components/modals/ConfirmationDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/utils/formatDate'
import { PERMISSIONS } from '@/constants/permissions'
import { ROUTES } from '@/constants/routes'
import { customersApi } from '../api/customersApi'
import { CustomerFormModal } from '../components/CustomerFormModal'
import { CUSTOMER_STATUS, CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_TONE, CUSTOMER_STATUS_OPTIONS, VISA_CATEGORY_OPTIONS } from '../constants'

const EMPTY_FILTERS = { status: '', assignedConsultant: null, visaCategory: '', country: '', fromDate: '', toDate: '' }

function detailPath(id) {
  return ROUTES.CUSTOMER_DETAIL.replace(':customerId', id)
}

export default function CustomerListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })

  const [formModal, setFormModal] = useState(null) // { mode: 'add'|'edit', customer? }
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [restoreTarget, setRestoreTarget] = useState(null)

  const hasActiveFilters = Object.entries(filters).some(([, value]) => Boolean(value))

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      assignedConsultant: filters.assignedConsultant?.value || undefined,
      visaCategory: filters.visaCategory || undefined,
      country: filters.country || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sortKey: sort?.key,
      sortDirection: sort?.direction,
    }),
    [page, pageSize, debouncedSearch, filters, sort],
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', 'list', queryParams],
    queryFn: () => customersApi.list(queryParams),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      toast.success('Customer registered successfully')
      setFormModal(null)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not register customer'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => customersApi.update(id, payload),
    onSuccess: () => {
      toast.success('Customer updated successfully')
      setFormModal(null)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not update customer'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id) => customersApi.archive(id),
    onSuccess: () => {
      toast.success('Customer archived')
      setArchiveTarget(null)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not archive customer'),
  })

  const restoreMutation = useMutation({
    mutationFn: (id) => customersApi.restore(id),
    onSuccess: () => {
      toast.success('Customer restored')
      setRestoreTarget(null)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not restore customer'),
  })

  function updateFilters(patch) {
    setPage(1)
    setFilters((current) => ({ ...current, ...patch }))
  }

  function clearFilters() {
    setPage(1)
    setFilters(EMPTY_FILTERS)
  }

  const columns = [
    { key: 'customerId', header: 'Customer ID', render: (row) => <span className="font-medium text-slate-800">{row.customerId}</span> },
    { key: 'fullName', header: 'Name', sortable: true },
    { key: 'mobile', header: 'Phone' },
    { key: 'whatsapp', header: 'WhatsApp', render: (row) => row.whatsapp || '—' },
    { key: 'email', header: 'Email', render: (row) => row.email || '—' },
    { key: 'passportNumber', header: 'Passport', render: (row) => row.passportNumber || '—' },
    { key: 'assignedConsultant', header: 'Assigned Consultant', render: (row) => row.assignedConsultant?.name ?? '—' },
    { key: 'activeCases', header: 'Active Cases', render: (row) => row.activeCases },
    { key: 'createdAt', header: 'Created Date', sortable: true, render: (row) => formatDate(row.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.status} tone={CUSTOMER_STATUS_TONE[row.status]} label={CUSTOMER_STATUS_LABELS[row.status]} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => navigate(detailPath(row.id))} title="View Profile" aria-label="View Profile">
            <Eye className="size-4" />
          </Button>
          <PermissionGuard permission={PERMISSIONS.CUSTOMERS_MANAGE}>
            <Button variant="ghost" size="sm" onClick={() => setFormModal({ mode: 'edit', customer: row })} title="Edit Customer" aria-label="Edit Customer">
              <Pencil className="size-4" />
            </Button>
            {row.status === CUSTOMER_STATUS.ARCHIVED ? (
              <Button variant="ghost" size="sm" onClick={() => setRestoreTarget(row)} title="Restore Customer" aria-label="Restore Customer">
                <ArchiveRestore className="size-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setArchiveTarget(row)} title="Archive Customer" aria-label="Archive Customer">
                <Archive className="size-4" />
              </Button>
            )}
          </PermissionGuard>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Registered customers across every visa category."
        breadcrumbItems={[{ label: 'Customers' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.CUSTOMERS_MANAGE}>
            <Button onClick={() => setFormModal({ mode: 'add' })}>
              <Plus className="size-4" /> Add Customer
            </Button>
          </PermissionGuard>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by Customer ID, Name, Phone or Passport..." className="max-w-sm" />
      </div>

      <div className="mb-4">
        <FilterBar onClear={clearFilters} hasActiveFilters={hasActiveFilters}>
          <SelectInput
            value={filters.status}
            onChange={(event) => updateFilters({ status: event.target.value })}
            options={CUSTOMER_STATUS_OPTIONS}
            placeholder="All Statuses"
            className="w-auto min-w-[9rem]"
          />
          <SelectInput
            value={filters.visaCategory}
            onChange={(event) => updateFilters({ visaCategory: event.target.value })}
            options={VISA_CATEGORY_OPTIONS}
            placeholder="All Visa Categories"
            className="w-auto min-w-[9rem]"
          />
          <div className="w-52">
            <StaffSelector value={filters.assignedConsultant} onChange={(option) => updateFilters({ assignedConsultant: option })} placeholder="Assigned Consultant..." />
          </div>
          <input
            value={filters.country}
            onChange={(event) => updateFilters({ country: event.target.value })}
            placeholder="Country..."
            className="h-9 w-36 rounded-lg border border-surface-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>Created</span>
            <input type="date" value={filters.fromDate} onChange={(event) => updateFilters({ fromDate: event.target.value })} className="h-9 rounded-lg border border-surface-border px-2 text-sm" aria-label="Created from" />
            <span>to</span>
            <input type="date" value={filters.toDate} onChange={(event) => updateFilters({ toDate: event.target.value })} className="h-9 rounded-lg border border-surface-border px-2 text-sm" aria-label="Created to" />
          </div>
        </FilterBar>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={isError ? error : null}
        onRetry={refetch}
        sort={sort}
        onSortChange={setSort}
        onRowClick={(row) => navigate(detailPath(row.id))}
        emptyTitle="No customers found"
        emptyDescription={hasActiveFilters || search ? 'Try adjusting your search or filters.' : 'Registered customers and converted leads will show up here.'}
      />

      {data?.pagination && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.pagination.total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      )}

      <CustomerFormModal
        isOpen={Boolean(formModal)}
        mode={formModal?.mode}
        customer={formModal?.customer}
        onClose={() => setFormModal(null)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={(payload) =>
          formModal?.mode === 'edit'
            ? updateMutation.mutate({ id: formModal.customer.id, payload })
            : createMutation.mutate(payload)
        }
      />

      <ConfirmationDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => archiveMutation.mutate(archiveTarget.id)}
        title="Archive customer?"
        description={`${archiveTarget?.fullName} will be archived and hidden from active customer lists. This can be undone later.`}
        confirmLabel="Archive"
        tone="danger"
        isLoading={archiveMutation.isPending}
      />

      <ConfirmationDialog
        isOpen={Boolean(restoreTarget)}
        onClose={() => setRestoreTarget(null)}
        onConfirm={() => restoreMutation.mutate(restoreTarget.id)}
        title="Restore customer?"
        description={`${restoreTarget?.fullName} will be marked active again.`}
        confirmLabel="Restore"
        isLoading={restoreMutation.isPending}
      />
    </div>
  )
}
