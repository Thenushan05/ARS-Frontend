import { useCallback, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/utils/cn'

function formatBytes(bytes) {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

/**
 * Drag-and-drop / click-to-browse file input used for document uploads
 * (§13), payment proof (§20), and expense receipts (§23). Only handles
 * client-side selection + validation — the caller's mutation (via the
 * relevant feature API, e.g. documentsApi.upload) does the actual upload.
 *
 *   <FileUploader accept="image/*,.pdf" maxSizeMb={10} onFilesSelected={setFiles} />
 */
export function FileUploader({
  accept,
  multiple = false,
  maxSizeMb = 10,
  onFilesSelected,
  helperText = `PDF, JPG or PNG up to ${maxSizeMb}MB`,
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList)
      const oversize = files.find((file) => file.size > maxSizeMb * 1024 * 1024)
      if (oversize) {
        setError(`"${oversize.name}" exceeds the ${maxSizeMb}MB limit.`)
        return
      }
      setError(null)
      onFilesSelected(multiple ? files : files.slice(0, 1))
    },
    [maxSizeMb, multiple, onFilesSelected],
  )

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-surface-border bg-surface-muted hover:bg-slate-100',
        )}
      >
        <UploadCloud className="size-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
        <p className="text-xs text-slate-500">{helperText}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => event.target.files && handleFiles(event.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-status-danger">{error}</p>}
    </div>
  )
}

export { formatBytes }
