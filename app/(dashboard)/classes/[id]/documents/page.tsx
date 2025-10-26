import { getDocumentsByClass } from '@/app/actions/documents'
import { getCurrentUser } from '@/app/actions/auth'
import { DocumentUploadForm } from '@/components/documents/upload-form'
import { DocumentList } from '@/components/documents/document-list'
import { AIAssistant } from '@/components/ai/ai-assistant'
import { redirect } from 'next/navigation'

interface ClassDocumentsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClassDocumentsPage({ params }: ClassDocumentsPageProps) {
  const { id: classId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get documents for this class
  const documents = await getDocumentsByClass(classId)

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Documents</h1>
        <p className="mt-2 text-gray-600">
          Upload and manage documents for this class
        </p>
      </div>

      {/* AI Assistant Section */}
      {documents.length > 0 && (
        <div className="mb-8">
          <AIAssistant classId={classId} />
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8">
        <DocumentUploadForm classId={classId} />
      </div>

      {/* Documents List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          All Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              No documents uploaded yet. Upload some course materials to get started with the AI assistant!
            </p>
          </div>
        ) : (
          <DocumentList
            documents={documents}
            showOwner={true}
            showDelete={true}
            currentUserId={user.id}
          />
        )}
      </div>
    </div>
  )
}
