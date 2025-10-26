import { getClassById } from '@/app/actions/classes'
import { getDocumentsByClass } from '@/app/actions/documents'
import { getCurrentUser } from '@/app/actions/auth'
import { getClassStudents, isEnrolledInClass, getClassEnrollmentCount } from '@/app/actions/enrollments'
import { DocumentUploadForm } from '@/components/documents/upload-form'
import { DocumentList } from '@/components/documents/document-list'
import { ClassRoster } from '@/components/classes/class-roster'
import { EnrollButton } from '@/components/classes/enroll-button'
import { redirect, notFound } from 'next/navigation'
import { BookOpen, FileText, Users, Copy } from 'lucide-react'
import Link from 'next/link'
import { ClassCodeDisplay } from '@/components/classes/class-code-display'

interface ClassPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClassPage({ params }: ClassPageProps) {
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

  const isProfessor = user.role === 'professor'
  const isStudent = user.role === 'student'

  // Get enrollment data
  const [documents, enrolledStudents, enrollmentCount, userIsEnrolled] = await Promise.all([
    getDocumentsByClass(classId),
    isProfessor ? getClassStudents(classId) : Promise.resolve([]),
    getClassEnrollmentCount(classId),
    isStudent ? isEnrolledInClass(classId) : Promise.resolve(false),
  ])

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/classes"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Classes
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {classData.class_name}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Enroll Button for Students */}
          {isStudent && !userIsEnrolled && (
            <EnrollButton classId={classId} />
          )}
        </div>
      </div>

      {/* Enrollment Status for Students */}
      {isStudent && userIsEnrolled && (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ You are enrolled in this class
          </p>
        </div>
      )}

      {/* Class Code Display for Professors */}
      {isProfessor && classData.class_code && (
        <div className="mb-8">
          <ClassCodeDisplay classCode={classData.class_code} />
        </div>
      )}

      {/* Student Roster for Professors */}
      {isProfessor && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Enrolled Students ({enrollmentCount})
          </h2>
          <ClassRoster students={enrolledStudents} />
        </div>
      )}

      {/* Upload Section (Professors and Students can upload) */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Upload Document
        </h2>
        <DocumentUploadForm classId={classId} />
      </div>

      {/* Documents List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Class Documents ({documents.length})
          </h2>
        </div>

        <DocumentList
          documents={documents}
          showOwner={true}
          showDelete={true}
          currentUserId={user.id}
        />

        {documents.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No documents yet
            </h3>
            <p className="text-sm text-gray-600">
              Be the first to upload a document to this class
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
