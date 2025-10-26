import { FileText, BookOpen } from 'react-icons/all'
import { getCurrentUser, getMyDocuments, getAllClasses } from '../lib/api'
import { redirect } from 'next/navigation'

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
        <h1 className="text-3xl font-bold text-gray-900">All Documents</h1>
        <p className="mt-2 text-gray-600">
          View and manage all your uploaded documents
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.length}
              </p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {classes.length}
              </p>
              <p className="text-sm text-gray-600">Classes</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {user?.name}
              </p>
              <p className="text-sm text-gray-600">User</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        <ul>
          {documentsWithClasses.map((doc) => (
            <li key={doc.id}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-3">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {doc.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {doc.class_name}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Classes */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
        <ul>
          {classes.map((c) => (
            <li key={c.class_id}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-3">
                  <BookOpen className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {c.class_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {c.class_id}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}