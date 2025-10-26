import { getAllClasses } from '@/app/actions/classes'
import { getCurrentUser } from '@/app/actions/auth'
import { CreateClassForm } from '@/components/classes/create-class-form'
import { JoinClassForm } from '@/components/classes/join-class-form'
import { ClassList } from '@/components/classes/class-list'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'

export default async function ClassesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const classes = await getAllClasses()
  const isProfessor = user.role === 'professor'

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="mt-2 text-gray-600">
          {isProfessor
            ? 'Manage your classes and course materials'
            : 'Browse and access your enrolled classes'}
        </p>
      </div>

      {/* Create Class Form (Professors Only) */}
      {isProfessor && (
        <div className="mb-8">
          <CreateClassForm />
        </div>
      )}

      {/* Join Class Form (Students Only) */}
      {!isProfessor && (
        <div className="mb-8">
          <JoinClassForm />
        </div>
      )}

      {/* Classes List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {isProfessor ? 'Your Classes' : 'Enrolled Classes'} ({classes.length})
        </h2>
        <ClassList classes={classes} />
      </div>

      {/* Empty State for Non-Professors */}
      {!isProfessor && classes.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No classes yet
          </h3>
          <p className="text-sm text-gray-600">
            Join a class using a class code to get started
          </p>
        </div>
      )}
    </div>
  )
}
