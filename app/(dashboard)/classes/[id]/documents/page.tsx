import { getClassById } from '@/app/actions/classes'
import { getDocumentsByClass } from '@/app/actions/documents'
import { getCurrentUser } from '@/app/actions/auth'
import { DocumentUploadForm } from '@/components/documents/upload-form'
import { DocumentList } from '@/components/documents/document-list'
import { ChatInterface } from '@/components/ai/chat-interface'
import { ReindexButton } from '@/components/ai/reindex-button'
import { ClassContextProvider } from '@/components/layout/class-context-provider'
import { Card } from '@/components/ui/card'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

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

  // Get class and documents
  const classData = await getClassById(classId)

  if (!classData) {
    notFound()
  }

  const documents = await getDocumentsByClass(classId)

  return (
    <ClassContextProvider classId={classId} className={classData.class_name || 'Class'}>
      <div className="container mx-auto max-w-7xl p-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href={`/classes/${classId}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Class
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Documents & AI</h1>
            <p className="mt-2 text-gray-600">
              {classData.class_name || 'Class'}
            </p>
          </div>
          {documents.length > 0 && (
            <ReindexButton classId={classId} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Documents */}
        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Upload Document
            </h2>
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

        {/* Right Column - AI Chat */}
        {documents.length > 0 && (
          <div className="lg:sticky lg:top-4 h-fit">
            <Card className="overflow-hidden bg-slate-900 border-white/10">
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-white">
                  AI Study Assistant
                </h2>
              </div>
              <div className="h-[600px]">
                <ChatInterface 
                  classId={classId} 
                  className={classData.class_name || 'Class'} 
                />
              </div>
            </Card>
          </div>
        )}
      </div>
      </div>
    </ClassContextProvider>
  )
}
