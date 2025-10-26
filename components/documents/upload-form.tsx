'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadDocument } from '@/app/actions/documents'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DocumentUploadFormProps {
  classId: string
  onUploadComplete?: () => void
}

export function DocumentUploadForm({
  classId,
  onUploadComplete,
}: DocumentUploadFormProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setUploading(true)
    setError(null)
    setSuccess(null)

    formData.append('classId', classId)

    const result = await uploadDocument(formData)

    setUploading(false)

    if (result.success) {
      setSuccess(`Document "${result.document?.title}" uploaded successfully!`)
      setSelectedFile(null)
      // Reset form
      const form = document.getElementById(
        'upload-form'
      ) as HTMLFormElement | null
      form?.reset()

      // Refresh the page to show the new document
      router.refresh()

      // Call callback
      if (onUploadComplete) {
        onUploadComplete()
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } else {
      setError(result.error || 'Upload failed')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Upload Document</h3>
      </div>

      <form id="upload-form" action={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label
            htmlFor="file"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select File
          </label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg,.xlsx"
            required
            disabled={uploading}
            className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Supported: PDF, PPTX, DOCX, PNG, JPG, XLSX (max 50MB)
          </p>
        </div>

        {/* Show selected file info */}
        {selectedFile && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3">
            <FileText className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Document Title
          </label>
          <Input
            type="text"
            id="title"
            name="title"
            placeholder="e.g., Lecture 5 Notes"
            required
            disabled={uploading}
            className="w-full"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={uploading || !selectedFile}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
