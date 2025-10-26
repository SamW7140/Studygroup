'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out'
    }
  }
}

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('Profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    ...profile
  }
}

export async function updateUserProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
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

    // Extract form data
    const username = formData.get('username') as string
    const fullName = formData.get('fullName') as string

    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Username is required' }
    }

    if (!fullName || fullName.trim().length === 0) {
      return { success: false, error: 'Full name is required' }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('Profiles')
      .update({
        username: username.trim(),
        full_name: fullName.trim(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return {
        success: false,
        error: `Failed to update profile: ${updateError.message}`,
      }
    }

    revalidatePath('/settings')
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    }
  }
}
