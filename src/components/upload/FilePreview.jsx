import { Download, Eye, File as FileIcon, RefreshCw, Trash2 } from 'lucide-react'
import { formatBytes } from './FileUploader'
import { Button } from '@/components/common/Button'

/**
 * Renders one uploaded (or pending-upload) file with a thumbnail/icon and
 * an actions row. `file` accepts either a browser File object (pre-upload
 * preview) or a backend record shape { name, url, sizeBytes, mimeType }.
 */
export function FilePreview({ file, onView, onDownload, onReplace, onRemove, canDownload = true }) {
  const name = file.name
  const size = file.size ?? file.sizeBytes
  const isImage = (file.type ?? file.mimeType ?? '').startsWith('image/')

  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-white p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        {isImage && file.url ? (
          <img src={file.url} alt={name} className="size-10 rounded-md object-cover" />
        ) : (
          <FileIcon className="size-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{name}</p>
        {size != null && <p className="text-xs text-slate-500">{formatBytes(size)}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onView && (
          <Button variant="ghost" size="sm" onClick={onView} aria-label="Preview">
            <Eye className="size-4" />
          </Button>
        )}
        {canDownload && onDownload && (
          <Button variant="ghost" size="sm" onClick={onDownload} aria-label="Download">
            <Download className="size-4" />
          </Button>
        )}
        {onReplace && (
          <Button variant="ghost" size="sm" onClick={onReplace} aria-label="Replace">
            <RefreshCw className="size-4" />
          </Button>
        )}
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove" className="text-status-danger hover:bg-status-danger-bg">
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
