import { getClassById, getClassSystemPrompt } from '@/app/actions/classes'
import { getCurrentUser } from '@/app/actions/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { SystemPromptEditor } from '@/components/classes/system-prompt-editor'

interface ClassSettingsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClassSettingsPage({ params }: ClassSettingsPageProps) {
  const { id: classId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Only professors can access settings
  if (user.role !== 'professor') {
    redirect(`/classes/${classId}`)
  }

  // Get class data
  const classData = await getClassById(classId)

  if (!classData) {
    notFound()
  }

  // Get the current system prompt
  const systemPromptResult = await getClassSystemPrompt(classId)
  const currentSystemPrompt = systemPromptResult.success ? systemPromptResult.systemPrompt : ''

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/classes/${classId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Class
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Class Settings</h1>
            <p className="text-sm text-muted-foreground">{classData.class_name}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* AI System Prompt Section */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">AI Assistant System Prompt</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize how the AI assistant behaves and responds to student questions in this class.
              This prompt sets the tone, style, and constraints for AI interactions.
            </p>
          </div>

          <SystemPromptEditor
            classId={classId}
            initialSystemPrompt={currentSystemPrompt || ''}
          />
        </div>

        {/* Future settings sections can be added here */}
        {/* For example: Class visibility, enrollment settings, etc. */}
      </div>
    </div>
  )
}
