import { Card, CardHeader, CardBody } from '@/components/common/Card'
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay'
import { formatDate } from '@/utils/formatDate'
import { GENDER_LABELS, MARITAL_STATUS_LABELS, VISA_CATEGORY_LABELS } from '../constants'

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-800">{value ?? '—'}</span>
    </div>
  )
}

/** Customer Profile "Overview" tab — read-only basic personal information
 * (§10). Editing happens via the same Edit Customer modal used from the
 * list, opened from this page's header — the tab itself is a detail view. */
export function OverviewTab({ customer }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Personal Information" />
        <CardBody className="divide-y divide-surface-border">
          <DetailRow label="Full Name" value={customer.fullName} />
          <DetailRow label="Passport Number" value={customer.passportNumber} />
          <DetailRow label="NIC" value={customer.nic} />
          <DetailRow label="Date of Birth" value={customer.dob ? formatDate(customer.dob) : null} />
          <DetailRow label="Gender" value={customer.gender ? GENDER_LABELS[customer.gender] : null} />
          <DetailRow label="Nationality" value={customer.nationality} />
          <DetailRow label="Marital Status" value={customer.maritalStatus ? MARITAL_STATUS_LABELS[customer.maritalStatus] : null} />
          <DetailRow label="Occupation" value={customer.occupation} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact & Address" />
        <CardBody className="divide-y divide-surface-border">
          <DetailRow label="Mobile" value={customer.mobile} />
          <DetailRow label="WhatsApp" value={customer.whatsapp} />
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Address" value={customer.address} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Financial Snapshot" description="Self-declared at registration — not a live account balance." />
        <CardBody className="divide-y divide-surface-border">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">Monthly Income</span>
            {customer.monthlyIncome != null ? <CurrencyDisplay amount={customer.monthlyIncome} /> : <span>—</span>}
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">Bank Balance</span>
            {customer.bankBalance != null ? <CurrencyDisplay amount={customer.bankBalance} /> : <span>—</span>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Visa Interest" />
        <CardBody className="divide-y divide-surface-border">
          <DetailRow label="Applying Country" value={customer.applyingCountry} />
          <DetailRow label="Visa Category" value={customer.visaCategory ? VISA_CATEGORY_LABELS[customer.visaCategory] : null} />
          <DetailRow label="Travel Purpose" value={customer.travelPurpose} />
          <DetailRow label="Previous Visa History" value={customer.previousVisaHistory} />
          <DetailRow label="Previous Refusals" value={customer.previousRefusals} />
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Assignment" />
        <CardBody className="grid grid-cols-1 gap-x-6 divide-y divide-surface-border sm:grid-cols-2 sm:divide-y-0">
          <DetailRow label="Assigned Consultant" value={customer.assignedConsultant?.name} />
          <DetailRow label="Branch" value={customer.branch?.name} />
          <DetailRow label="Lead Source" value={customer.leadSource} />
          <DetailRow label="Registered On" value={formatDate(customer.createdAt)} />
        </CardBody>
        {customer.notes && <div className="mx-5 mb-4 rounded-lg bg-surface-muted p-3 text-sm text-slate-600">{customer.notes}</div>}
      </Card>
    </div>
  )
}
