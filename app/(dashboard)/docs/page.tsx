import { getMyDocuments } from '@/app/actions/documents'
import { getAllClasses } from '@/app/actions/classes'
import { getCurrentUser } from '@/app/actions/auth'
import { DocumentList } from '@/components/documents/document-list'
import { redirect } from 'next/navigation'
import { FileText, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function AllDocumentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get all documents and classes
  const [documents, classes] = await Promise.all([
    getMyDocuments(),
    getAllClasses(),
  ])

  // Create a map of class IDs to class names
  const classMap = new Map(
    classes.map((c) => [c.class_id, c.class_name])
  )

  // Enhance documents with class names
  const documentsWithClasses = documents.map((doc) => ({
    ...doc,
    class_name: doc.class_id ? classMap.get(doc.class_id) || null : null,
  }))

  // Group documents by class
  const documentsByClass = documents.reduce((acc, doc) => {
    const classId = doc.class_id || 'unassigned'
    if (!acc[classId]) {
      acc[classId] = []
    }
    acc[classId].push(doc)
    return acc
  }, {} as Record<string, typeof documents>)

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Documents</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage all your uploaded documents
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {documents.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Documents</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-3">
              <BookOpen className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {classes.length}
              </p>
              <p className="text-sm text-muted-foreground">Classes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents by Class */}
      <div className="space-y-8">
        {Object.entries(documentsByClass).map(([classId, classDocs]) => {
          const className =
            classId === 'unassigned'
              ? 'Unassigned Documents'
              : classMap.get(classId) || 'Unknown Class'

          return (
            <div key={classId}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {className}
                </h2>
                {classId !== 'unassigned' && (
                  <Link
                    href={`/classes/${classId}`}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View class →
                  </Link>
                )}
              </div>

              <DocumentList
                documents={classDocs.map((doc) => ({
                  ...doc,
                  class_name: className,
                }))}
                showOwner={user.role !== 'professor'}
                showDelete={true}
                currentUserId={user.id}
              />
            </div>
          )
        })}

        {documents.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No documents yet
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload your first document to get started
            </p>
            <Link
              href="/classes"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Browse Classes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
