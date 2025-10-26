'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface EnrollmentWithUser {
  user_id: string
  class_id: string
  enrolled_at: string
  user: {
    full_name: string | null
    username: string | null
    email: string | null
    role: string | null
  }
}

/**
 * Enroll a student in a class
 */
export async function enrollInClass(classId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('class_enrollments')
      .select('*')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { success: false, error: 'Already enrolled in this class' }
    }

    // Enroll
    const { error: enrollError } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classId,
        user_id: user.id,
      })

    if (enrollError) {
      console.error('Enrollment error:', enrollError)
      return { success: false, error: 'Failed to enroll' }
    }

    revalidatePath(`/classes/${classId}`)

    return { success: true }
  } catch (error) {
    console.error('Enrollment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll',
    }
  }
}

/**
 * Enroll in a class using a class code
 */
export async function enrollByClassCode(classCode: string): Promise<{
  success: boolean
  className?: string
  classId?: string
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Find the class by code
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id, class_name')
      .eq('class_code', classCode.toUpperCase())
      .single()

    if (classError || !classData) {
      return { success: false, error: 'Invalid class code' }
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('class_enrollments')
      .select('*')
      .eq('class_id', classData.class_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { success: false, error: 'You are already enrolled in this class' }
    }

    // Enroll
    const { error: enrollError } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classData.class_id,
        user_id: user.id,
      })

    if (enrollError) {
      console.error('Enrollment error:', enrollError)
      return { success: false, error: 'Failed to enroll in class' }
    }

    revalidatePath('/classes')
    revalidatePath(`/classes/${classData.class_id}`)

    return { 
      success: true,
      className: classData.class_name || 'Unknown Class',
      classId: classData.class_id
    }
  } catch (error) {
    console.error('Enrollment by code error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll',
    }
  }
}

/**
 * Get all students enrolled in a class (professors only)
 */
export async function getClassStudents(
  classId: string
): Promise<EnrollmentWithUser[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    // Check if user is a professor
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professor') {
      return []
    }

    // Get enrollments with user details
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(
        `
        user_id,
        class_id,
        enrolled_at,
        Profiles (
          full_name,
          username,
          email,
          role
        )
      `
      )
      .eq('class_id', classId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Error fetching students:', error)
      return []
    }

    return (
      data?.map((enrollment: any) => ({
        user_id: enrollment.user_id,
        class_id: enrollment.class_id,
        enrolled_at: enrollment.enrolled_at,
        user: {
          full_name: enrollment.Profiles?.full_name || null,
          username: enrollment.Profiles?.username || null,
          email: enrollment.Profiles?.email || null,
          role: enrollment.Profiles?.role || null,
        },
      })) || []
    )
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}

/**
 * Get enrollment count for a class
 */
export async function getClassEnrollmentCount(
  classId: string
): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient()

    const { count, error } = await supabase
      .from('class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)

    if (error) {
      console.error('Error counting enrollments:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error counting enrollments:', error)
    return 0
  }
}

/**
 * Check if current user is enrolled in a class
 */
export async function isEnrolledInClass(classId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data, error } = await supabase
      .from('class_enrollments')
      .select('*')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
