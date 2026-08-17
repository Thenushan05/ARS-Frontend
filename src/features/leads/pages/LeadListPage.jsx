import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Pencil, PhoneCall, Plus, UserCheck, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { DataTable } from '@/components/tables/DataTable'
import { Pagination } from '@/components/tables/Pagination'
import { SearchBar } from '@/components/tables/SearchBar'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { formatDate } from '@/utils/formatDate'
import { PERMISSIONS } from '@/constants/permissions'
import { leadsApi } from '../api/leadsApi'
import { LeadFiltersBar } from '../components/LeadFiltersBar'
import { LeadFormModal } from '../components/LeadFormModal'
import { AddFollowUpModal } from '../components/AddFollowUpModal'
import { ConvertToCustomerModal } from '../components/ConvertToCustomerModal'
import { ViewLeadDrawer } from '../components/ViewLeadDrawer'
import { LEAD_SOURCE_LABELS, LEAD_STATUS, LEAD_STATUS_LABELS, LEAD_STATUS_TONE, VISA_CATEGORY_LABELS } from '../constants'

const EMPTY_FILTERS = { status: '', leadSource: '', assignedStaff: null, visaType: '', country: '', fromDate: '', toDate: '' }

function isOverdue(followUpDate, status) {
  if (!followUpDate) return false
  if (status === LEAD_STATUS.REGISTERED || status === LEAD_STATUS.NOT_INTERESTED) return false
  return new Date(followUpDate) < new Date(new Date().toDateString())
}

export default function LeadListPage() {
  const { can } = usePermission()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })

  const [formModal, setFormModal] = useState(null) // { mode: 'add'|'edit', lead? }
  const [viewLead, setViewLead] = useState(null)
  const [followUpLead, setFollowUpLead] = useState(null)
  const [convertLead, setConvertLead] = useState(null)

  const hasActiveFilters = Object.entries(filters).some(([, value]) => Boolean(value))

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      leadSource: filters.leadSource || undefined,
      assignedStaff: filters.assignedStaff?.value || undefined,
      visaType: filters.visaType || undefined,
      country: filters.country || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sortKey: sort?.key,
      sortDirection: sort?.direction,
    }),
    [page, pageSize, debouncedSearch, filters, sort],
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['leads', 'list', queryParams],
    queryFn: () => leadsApi.list(queryParams),
  })

  function invalidateLeads() {
    queryClient.invalidateQueries({ queryKey: ['leads'] })
  }

  const createMutation = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      toast.success('Lead added successfully')
      setFormModal(null)
      invalidateLeads()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add lead'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => leadsApi.update(id, payload),
    onSuccess: () => {
      toast.success('Lead updated successfully')
      setFormModal(null)
      invalidateLeads()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not update lead'),
  })

  const followUpMutation = useMutation({
    mutationFn: ({ id, payload }) => leadsApi.addFollowUp(id, payload),
    onSuccess: () => {
      toast.success('Follow-up added successfully')
      setFollowUpLead(null)
      invalidateLeads()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not add follow-up'),
  })

  const convertMutation = useMutation({
    mutationFn: ({ id, payload }) => leadsApi.convertToCustomer(id, payload),
    onSuccess: (result) => {
      toast.success(result.wasExisting ? 'Lead linked to an existing customer' : 'Lead converted to a new customer')
      setConvertLead(null)
      invalidateLeads()
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Could not convert lead'),
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
    { key: 'leadId', header: 'Lead ID', render: (row) => <span className="font-medium text-slate-800">{row.leadId}</span> },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'mobile', header: 'Phone' },
    { key: 'interestedCountry', header: 'Country', render: (row) => row.interestedCountry || '—' },
    {
      key: 'interestedVisaType',
      header: 'Visa Type',
      render: (row) => (row.interestedVisaType ? VISA_CATEGORY_LABELS[row.interestedVisaType] : '—'),
    },
    { key: 'leadSource', header: 'Lead Source', render: (row) => LEAD_SOURCE_LABELS[row.leadSource] ?? row.leadSource },
    { key: 'assignedStaff', header: 'Assigned Staff', render: (row) => row.assignedStaff?.name ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.status} tone={LEAD_STATUS_TONE[row.status]} label={LEAD_STATUS_LABELS[row.status]} />
      ),
    },
    {
      key: 'followUpDate',
      header: 'Follow-up Date',
      sortable: true,
      render: (row) =>
        row.followUpDate ? (
          <span className={isOverdue(row.followUpDate, row.status) ? 'font-medium text-status-danger' : undefined}>
            {formatDate(row.followUpDate)}
          </span>
        ) : (
          '—'
        ),
    },
    { key: 'createdAt', header: 'Created Date', sortable: true, render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setViewLead(row)} title="View Lead" aria-label="View Lead">
            <Eye className="size-4" />
          </Button>
          <PermissionGuard permission={PERMISSIONS.LEADS_MANAGE}>
            <Button variant="ghost" size="sm" onClick={() => setFormModal({ mode: 'edit', lead: row })} title="Edit Lead" aria-label="Edit Lead">
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFollowUpLead(row)} title="Add Follow-up" aria-label="Add Follow-up">
              <PhoneCall className="size-4" />
            </Button>
          </PermissionGuard>
          {!row.convertedCustomer && (
            <PermissionGuard allOf={[PERMISSIONS.LEADS_MANAGE, PERMISSIONS.CUSTOMERS_MANAGE]}>
              <Button variant="ghost" size="sm" onClick={() => setConvertLead(row)} title="Convert to Customer" aria-label="Convert to Customer">
                <UserCheck className="size-4" />
              </Button>
            </PermissionGuard>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track inbound interest through to registration."
        breadcrumbItems={[{ label: 'Leads' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.LEADS_MANAGE}>
            <Button onClick={() => setFormModal({ mode: 'add' })}>
              <Plus className="size-4" /> Add Lead
            </Button>
          </PermissionGuard>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by Lead ID, Name or Phone..." className="max-w-sm" />
      </div>

      <div className="mb-4">
        <LeadFiltersBar filters={filters} onChange={updateFilters} onClear={clearFilters} hasActiveFilters={hasActiveFilters} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={isError ? error : null}
        onRetry={refetch}
        sort={sort}
        onSortChange={setSort}
        onRowClick={setViewLead}
        emptyTitle="No leads found"
        emptyDescription={hasActiveFilters || search ? 'Try adjusting your search or filters.' : 'Leads captured from any channel will show up here.'}
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

      <LeadFormModal
        isOpen={Boolean(formModal)}
        mode={formModal?.mode}
        lead={formModal?.lead}
        onClose={() => setFormModal(null)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={(payload) =>
          formModal?.mode === 'edit'
            ? updateMutation.mutate({ id: formModal.lead.id, payload })
            : createMutation.mutate(payload)
        }
      />

      <AddFollowUpModal
        isOpen={Boolean(followUpLead)}
        lead={followUpLead}
        onClose={() => setFollowUpLead(null)}
        isSubmitting={followUpMutation.isPending}
        onSubmit={(payload) => followUpMutation.mutate({ id: followUpLead.id, payload })}
      />

      <ConvertToCustomerModal
        isOpen={Boolean(convertLead)}
        lead={convertLead}
        onClose={() => setConvertLead(null)}
        isSubmitting={convertMutation.isPending}
        onSubmit={(payload) => convertMutation.mutate({ id: convertLead.id, payload })}
      />

      <ViewLeadDrawer
        isOpen={Boolean(viewLead)}
        lead={viewLead}
        onClose={() => setViewLead(null)}
        onEdit={(lead) => {
          setViewLead(null)
          setFormModal({ mode: 'edit', lead })
        }}
        onAddFollowUp={(lead) => {
          setViewLead(null)
          setFollowUpLead(lead)
        }}
        onConvert={(lead) => {
          setViewLead(null)
          setConvertLead(lead)
        }}
      />

      {!can(PERMISSIONS.LEADS_MANAGE) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <UserPlus className="size-3.5" /> You have view-only access to leads.
        </p>
      )}
    </div>
  )
}
