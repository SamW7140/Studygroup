'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClassWithDetails {
  class_id: string
  class_name: string
  class_code?: string
  created_at: string
  professor_id?: string
  professor_name?: string
  professor_username?: string
  document_count?: number
  enrollment_count?: number
}

export interface CreateClassResult {
  success: boolean
  class?: ClassWithDetails
  error?: string
}

/**
 * Create a new class (professors only)
 */
export async function createClass(formData: FormData): Promise<CreateClassResult> {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is a professor
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professor') {
      return { success: false, error: 'Only professors can create classes' }
    }

    // Get form data
    const className = formData.get('className') as string

    if (!className || className.trim().length === 0) {
      return { success: false, error: 'Class name is required' }
    }

    // Create the class
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({
        class_name: className.trim(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating class:', createError)
      return { success: false, error: `Failed to create class: ${createError.message}` }
    }

    revalidatePath('/classes')

    return {
      success: true,
      class: {
        class_id: newClass.class_id,
        class_name: newClass.class_name || '',
        class_code: newClass.class_code || undefined,
        created_at: newClass.created_at,
      },
    }
  } catch (error) {
    console.error('Create class error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create class',
    }
  }
}

/**
 * Get all classes (filtered by user role)
 * - Students: Only see classes they're enrolled in
 * - Professors: See all classes (for now, could be filtered to their own classes)
 */
export async function getAllClasses(): Promise<ClassWithDetails[]> {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return []
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If student, only get enrolled classes
    if (profile?.role === 'student') {
      // Get enrolled class IDs
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('user_id', user.id)

      if (enrollError) {
        console.error('Error fetching enrollments:', enrollError)
        return []
      }

      const enrolledClassIds = enrollments?.map((e) => e.class_id) || []

      if (enrolledClassIds.length === 0) {
        return []
      }

      // Get only enrolled classes
      const { data, error } = await supabase
        .from('classes')
        .select('class_id, class_name, class_code, created_at')
        .in('class_id', enrolledClassIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching classes:', error)
        return []
      }

      // Get document counts for each class
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const [{ count: docCount }, { count: enrollmentCount }] = await Promise.all([
            supabase
              .from('documents')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.class_id),
            supabase
              .from('class_enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.class_id),
          ])

          return {
            class_id: cls.class_id,
            class_name: cls.class_name || 'Untitled Class',
            class_code: cls.class_code || undefined,
            created_at: cls.created_at,
            document_count: docCount || 0,
            enrollment_count: enrollmentCount || 0,
          }
        })
      )

      return classesWithCounts
    }

    // For professors, get all classes
    const { data, error } = await supabase
      .from('classes')
      .select('class_id, class_name, class_code, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching classes:', error)
      return []
    }

    // Get document counts for each class
    const classesWithCounts = await Promise.all(
      (data || []).map(async (cls) => {
        const [{ count: docCount }, { count: enrollmentCount }] = await Promise.all([
          supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.class_id),
          supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.class_id),
        ])

        return {
          class_id: cls.class_id,
          class_name: cls.class_name || 'Untitled Class',
          class_code: cls.class_code || undefined,
          created_at: cls.created_at,
          document_count: docCount || 0,
          enrollment_count: enrollmentCount || 0,
        }
      })
    )

    return classesWithCounts
  } catch (error) {
    console.error('Error fetching classes:', error)
    return []
  }
}

/**
 * Get a single class by ID
 */
export async function getClassById(classId: string): Promise<ClassWithDetails | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('classes')
      .select('class_id, class_name, class_code, created_at')
      .eq('class_id', classId)
      .single()

    if (error || !data) {
      return null
    }

    // Get document count
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)

    return {
      class_id: data.class_id,
      class_name: data.class_name || 'Untitled Class',
      class_code: data.class_code || undefined,
      created_at: data.created_at,
      document_count: count || 0,
    }
  } catch (error) {
    console.error('Error fetching class:', error)
    return null
  }
}

/**
 * Delete a class (professors only)
 */
export async function deleteClass(classId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is a professor
    const { data: profile } = await supabase
      .from('Profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professor') {
      return { success: false, error: 'Only professors can delete classes' }
    }

    // Delete the class (CASCADE will delete related documents)
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('class_id', classId)

    if (deleteError) {
      console.error('Error deleting class:', deleteError)
      return { success: false, error: `Failed to delete class: ${deleteError.message}` }
    }

    revalidatePath('/classes')

    return { success: true }
  } catch (error) {
    console.error('Delete class error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete class',
    }
  }
}
