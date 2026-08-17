import { useQuery } from '@tanstack/react-query'
import { PhoneCall, Pencil, UserCheck } from 'lucide-react'
import { Drawer } from '@/components/modals/Drawer'
import { Button } from '@/components/common/Button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { PERMISSIONS } from '@/constants/permissions'
import { leadsApi } from '../api/leadsApi'
import {
  LEAD_STATUS_LABELS, LEAD_STATUS_TONE, LEAD_SOURCE_LABELS, VISA_CATEGORY_LABELS, FOLLOW_UP_METHOD_LABELS,
} from '../constants'

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value ?? '—'}</span>
    </div>
  )
}

/** "View Lead" — full detail + follow-up history, with the same
 * Edit/Add Follow-up/Convert actions available from the list row. */
export function ViewLeadDrawer({ isOpen, onClose, lead, onEdit, onAddFollowUp, onConvert }) {
  const { data, isLoading } = useQuery({
    queryKey: ['leads', lead?.id, 'follow-ups'],
    queryFn: () => leadsApi.listFollowUps(lead.id, { limit: 20 }),
    enabled: isOpen && Boolean(lead),
  })

  if (!lead) return null

  const isConverted = Boolean(lead.convertedCustomer)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead.leadId}
      width="lg"
      footer={
        <>
          <PermissionGuard permission={PERMISSIONS.LEADS_MANAGE}>
            <Button variant="secondary" onClick={() => onAddFollowUp(lead)}>
              <PhoneCall className="size-4" /> Add Follow-up
            </Button>
            <Button variant="secondary" onClick={() => onEdit(lead)}>
              <Pencil className="size-4" /> Edit
            </Button>
          </PermissionGuard>
          {!isConverted && (
            <PermissionGuard allOf={[PERMISSIONS.LEADS_MANAGE, PERMISSIONS.CUSTOMERS_MANAGE]}>
              <Button onClick={() => onConvert(lead)}>
                <UserCheck className="size-4" /> Convert to Customer
              </Button>
            </PermissionGuard>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{lead.name}</h3>
            <StatusBadge status={lead.status} tone={LEAD_STATUS_TONE[lead.status]} label={LEAD_STATUS_LABELS[lead.status]} />
          </div>
          <div className="divide-y divide-surface-border rounded-lg border border-surface-border px-3">
            <DetailRow label="Mobile" value={lead.mobile} />
            <DetailRow label="WhatsApp" value={lead.whatsapp} />
            <DetailRow label="Email" value={lead.email} />
            <DetailRow label="Interested Country" value={lead.interestedCountry} />
            <DetailRow label="Visa Type" value={lead.interestedVisaType ? VISA_CATEGORY_LABELS[lead.interestedVisaType] : null} />
            <DetailRow label="Lead Source" value={LEAD_SOURCE_LABELS[lead.leadSource]} />
            <DetailRow label="Assigned Staff" value={lead.assignedStaff?.name} />
            <DetailRow label="Branch" value={lead.branch?.name} />
            <DetailRow label="Follow-up Date" value={lead.followUpDate ? formatDate(lead.followUpDate) : null} />
            <DetailRow label="Created" value={formatDateTime(lead.createdAt)} />
          </div>
          {lead.notes && <div className="mt-3 rounded-lg bg-surface-muted p-3 text-sm text-slate-600">{lead.notes}</div>}
          {isConverted && <p className="mt-3 text-sm font-medium text-status-success">✓ Converted to customer</p>}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Follow-up History</h3>
          {isLoading ? (
            <LoadingSkeleton rows={3} className="h-12" />
          ) : !data?.items?.length ? (
            <EmptyState title="No follow-ups logged yet" />
          ) : (
            <ul className="space-y-2">
              {data.items.map((item) => (
                <li key={item.id} className="rounded-lg border border-surface-border p-3 text-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{FOLLOW_UP_METHOD_LABELS[item.method]}</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-slate-700">{item.notes}</p>
                  {item.nextFollowUpDate && (
                    <p className="mt-1 text-xs text-slate-500">Next follow-up: {formatDate(item.nextFollowUpDate)}</p>
                  )}
                  {item.createdBy?.name && <p className="mt-1 text-xs text-slate-400">by {item.createdBy.name}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  )
}
