/**
 * Design-system status semantics (§46). Five meanings only — resist adding
 * more colors; the value of the system is that a color always means the
 * same thing everywhere in the app.
 *
 *   success (green)  = Paid / Approved / Completed
 *   warning (yellow) = Pending / Part Paid
 *   danger  (red)    = Refused / Overdue / Error
 *   info    (blue)   = Active / Processing
 *   neutral (grey)   = Closed / Cancelled / Inactive
 */
export const STATUS_TONES = Object.freeze({
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  NEUTRAL: 'neutral',
})

export const TONE_CLASSES = Object.freeze({
  [STATUS_TONES.SUCCESS]: 'text-status-success bg-status-success-bg border-status-success-border',
  [STATUS_TONES.WARNING]: 'text-status-warning bg-status-warning-bg border-status-warning-border',
  [STATUS_TONES.DANGER]: 'text-status-danger bg-status-danger-bg border-status-danger-border',
  [STATUS_TONES.INFO]: 'text-status-info bg-status-info-bg border-status-info-border',
  [STATUS_TONES.NEUTRAL]: 'text-status-neutral bg-status-neutral-bg border-status-neutral-border',
})

/**
 * Maps domain status strings (case status, invoice status, etc.) to a tone.
 * Extend this map as new statuses are introduced — never invent a new tone.
 */
export const STATUS_TONE_MAP = Object.freeze({
  // Visa case flow (§12)
  new_inquiry: STATUS_TONES.NEUTRAL,
  registered: STATUS_TONES.INFO,
  documents_pending: STATUS_TONES.WARNING,
  documents_received: STATUS_TONES.INFO,
  document_verification: STATUS_TONES.INFO,
  application_preparation: STATUS_TONES.INFO,
  appointment_pending: STATUS_TONES.WARNING,
  submitted: STATUS_TONES.INFO,
  biometrics_completed: STATUS_TONES.INFO,
  embassy_processing: STATUS_TONES.INFO,
  additional_documents_requested: STATUS_TONES.WARNING,
  decision_pending: STATUS_TONES.WARNING,
  approved: STATUS_TONES.SUCCESS,
  refused: STATUS_TONES.DANGER,
  withdrawn: STATUS_TONES.NEUTRAL,

  // Invoices (§19)
  unpaid: STATUS_TONES.DANGER,
  part_paid: STATUS_TONES.WARNING,
  paid: STATUS_TONES.SUCCESS,
  overdue: STATUS_TONES.DANGER,
  cancelled: STATUS_TONES.NEUTRAL,

  // Quotations (§18)
  draft: STATUS_TONES.NEUTRAL,
  sent: STATUS_TONES.INFO,
  accepted: STATUS_TONES.SUCCESS,
  rejected: STATUS_TONES.DANGER,
  expired: STATUS_TONES.NEUTRAL,
  converted: STATUS_TONES.SUCCESS,

  // Tasks (§31)
  pending: STATUS_TONES.WARNING,
  in_progress: STATUS_TONES.INFO,
  completed: STATUS_TONES.SUCCESS,

  // Generic
  active: STATUS_TONES.INFO,
  inactive: STATUS_TONES.NEUTRAL,
})

export function toneForStatus(status) {
  if (!status) return STATUS_TONES.NEUTRAL
  return STATUS_TONE_MAP[status] ?? STATUS_TONES.NEUTRAL
}
