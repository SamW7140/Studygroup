'use client'

import { useState } from 'react'
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  deleteDocument,
  getDocumentDownloadUrl,
  type DocumentWithDetails,
} from '@/app/actions/documents'
import { formatFileSize } from '@/lib/utils'

interface DocumentListProps {
  documents: DocumentWithDetails[]
  showOwner?: boolean
  showDelete?: boolean
  currentUserId?: string
  onDocumentDeleted?: () => void
}

export function DocumentList({
  documents,
  showOwner = true,
  showDelete = false,
  currentUserId,
  onDocumentDeleted,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  function getFileIcon(fileType: string) {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />
      case 'pptx':
        return <Presentation className="h-5 w-5 text-orange-400" />
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-400" />
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-400" />
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <ImageIcon className="h-5 w-5 text-purple-400" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  async function handleDownload(storagePath: string, title: string) {
    setDownloadingId(storagePath)
    
    const url = await getDocumentDownloadUrl(storagePath)
    
    if (url) {
      // Open in new tab or trigger download
      window.open(url, '_blank')
    } else {
      alert('Failed to get download URL')
    }
    
    setDownloadingId(null)
  }

  async function handleDelete(documentId: string) {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    setDeletingId(documentId)

    const result = await deleteDocument(documentId)

    setDeletingId(null)

    if (result.success) {
      if (onDocumentDeleted) {
        onDocumentDeleted()
      }
    } else {
      alert(result.error || 'Failed to delete document')
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`

    return date.toLocaleDateString()
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <FileText className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No documents yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const isOwner = currentUserId === doc.id
        const canDelete = showDelete && isOwner

        return (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            {/* Left: Icon and Info */}
            <div className="flex flex-1 items-center gap-3">
              {getFileIcon(doc.file_type)}

              <div className="flex-1">
                <h4 className="font-medium text-card-foreground">{doc.title}</h4>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {showOwner && doc.owner_name && (
                    <span>{doc.owner_name}</span>
                  )}
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>{formatDate(doc.created_at)}</span>
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono uppercase">
                    {doc.file_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleDownload(doc.storage_path || '', doc.title)
                }
                disabled={downloadingId === doc.storage_path}
              >
                <Download className="h-4 w-4" />
              </Button>

              {canDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
