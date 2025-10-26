import { getClassById } from '@/app/actions/classes'
import { getDocumentsByClass } from '@/app/actions/documents'
import { getCurrentUser } from '@/app/actions/auth'
import { ClassAIPage } from '@/components/ai/class-ai-page'
import { ClassContextProvider } from '@/components/layout/class-context-provider'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'

interface ClassAIPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AIPage({ params }: ClassAIPageProps) {
  const { id: classId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get class data
  const classData = await getClassById(classId)

  if (!classData) {
    notFound()
  }

  // Check if class has documents
  const documents = await getDocumentsByClass(classId)

  if (documents.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <div className="mb-4">
          <Link
            href={`/classes/${classId}`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Class
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No documents yet
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Upload some course materials first to start using the AI assistant
          </p>
          <Link
            href={`/classes/${classId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Class Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ClassContextProvider classId={classId} className={classData.class_name || 'Class'}>
      <ClassAIPage classId={classId} className={classData.class_name || 'Class'} />
    </ClassContextProvider>
  )
}
