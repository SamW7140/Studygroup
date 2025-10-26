'use client'

import { useState } from 'react'
import { Users, Calendar, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { EnrollmentWithUser } from '@/app/actions/enrollments'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ClassRosterProps {
  students: EnrollmentWithUser[]
}

export function ClassRoster({ students }: ClassRosterProps) {
  console.log('ClassRoster received students:', students)
  console.log('Students array length:', students.length)
  
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function getInitials(name: string | null): string {
    if (!name) return '??'
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <Users className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-600">No students enrolled yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {students.map((enrollment) => (
        <Card
          key={enrollment.user_id}
          className="border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(enrollment.user.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Student Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {enrollment.user.full_name || 'Unknown User'}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>@{enrollment.user.username || 'unknown'}</span>
                {enrollment.user.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{enrollment.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Date */}
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(enrollment.enrolled_at)}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
