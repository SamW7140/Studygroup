'use client'

import Link from 'next/link'
import { BookOpen, FileText, Calendar, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { ClassWithDetails } from '@/app/actions/classes'

interface ClassListProps {
  classes: ClassWithDetails[]
}

export function ClassList({ classes }: ClassListProps) {
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (classes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <BookOpen className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No classes yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create a class to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Link key={cls.class_id} href={`/classes/${cls.class_id}`}>
          <Card className="group cursor-pointer border-border bg-card p-6 transition-all hover:border-blue-400 hover:shadow-lg">
            {/* Class Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <BookOpen className="h-6 w-6" />
            </div>

            {/* Class Name */}
            <h3 className="mb-2 text-lg font-semibold text-card-foreground line-clamp-1">
              {cls.class_name}
            </h3>

            {/* Stats */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {cls.document_count || 0} document
                  {cls.document_count !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {cls.enrollment_count || 0} student
                  {cls.enrollment_count !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(cls.created_at)}</span>
              </div>
            </div>

            {/* View Button */}
            <div className="mt-4 text-sm font-medium text-blue-400 group-hover:text-blue-300">
              View class →
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
