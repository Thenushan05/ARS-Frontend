import { Modal } from './Modal'
import { Button } from '@/components/common/Button'

/**
 * Modal wrapper for a form (e.g. "New Lead", "Record Payment"). The caller
 * owns the <form> element and its React Hook Form instance; this component
 * only supplies the chrome + submit/cancel footer.
 *
 *   <FormDialog isOpen={open} onClose={close} title="New Lead" onSubmit={handleSubmit(onSubmit)} isSubmitting={isPending}>
 *     <FormField .../> ...
 *   </FormDialog>
 */
export function FormDialog({
  isOpen,
  onClose,
  title,
  size,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting,
  children,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button type="submit" form="form-dialog-form" isLoading={isSubmitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="form-dialog-form" onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  )
}
