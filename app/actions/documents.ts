'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { invalidateAICache } from './ai-query'

export interface DocumentUploadResult {
  success: boolean
  document?: {
    id: string
    title: string
    file_type: string
    storage_path: string
  }
  error?: string
}

export interface DocumentWithDetails {
  id: string
  title: string
  file_type: string
  file_size: number | null
  storage_path: string | null
  created_at: string
  updated_at: string | null
  classroom_id: string | null
  class_name: string | null
  owner_name: string | null
  owner_username: string | null
}

/**
 * Upload a document to Supabase Storage and create database entry
 */
export async function uploadDocument(
  formData: FormData
): Promise<DocumentUploadResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Extract form data
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const classId = formData.get('classId') as string

    console.log('Debug - Form Data received:', {
      hasFile: !!file,
      fileName: file?.name,
      title,
      classId,
      userId: user.id // Debug user ID as well
    })

    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    if (!title) {
      return { success: false, error: 'Title is required' }
    }

    if (!classId) {
      return { success: false, error: 'Class ID is required' }
    }

    // Get file extension and type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileType = fileExtension as string

    // Validate file type
    const allowedTypes = ['pdf', 'pptx', 'docx', 'png', 'jpg', 'jpeg', 'xlsx']
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: `File type .${fileType} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      }
    }

    // Create storage path: {user_id}/{class_id}/{timestamp}_{filename}
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${classId}/${timestamp}_${sanitizedFilename}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      }
    }

    // Create database entry
    const documentData = {
      user_id: user.id,
      title: title,
      storage_path: storagePath,
      file_type: fileType,
      file_size: file.size,
      classroom_id: classId  // Fixed: using classroom_id instead of class_id
    }

    console.log('Debug - Inserting document with data:', documentData)

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from('documents').remove([storagePath])

      console.error('Database insert error:', dbError)
      return {
        success: false,
        error: `Database error: ${dbError.message}`,
      }
    }

    revalidatePath('/docs')
    revalidatePath(`/classes/${classId}`)
    revalidatePath(`/dashboard/classes/${classId}/documents`)

    // Invalidate AI cache for this class (fire and forget)
    try {
      await invalidateAICache(classId)
    } catch (cacheError) {
      // Don't fail the upload if cache invalidation fails
      console.warn('Failed to invalidate AI cache:', cacheError)
    }

    return {
      success: true,
      document: {
        id: document.id,
        title: document.title || '',
        file_type: document.file_type || '',
        storage_path: document.storage_path || '',
      },
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Get all documents for a class
 */
export async function getDocumentsByClass(
  classId: string
): Promise<DocumentWithDetails[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        file_type,
        file_size,
        storage_path,
        created_at,
        updated_at,
        classroom_id,
        classes (class_name),
        Profiles (full_name, username)
      `)
      .eq('classroom_id', classId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return (
      data?.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        file_type: doc.file_type,
        file_size: doc.file_size,
        storage_path: doc.storage_path,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        classroom_id: doc.classroom_id,
        class_name: doc.classes?.class_name || null,
        owner_name: doc.Profiles?.full_name || null,
        owner_username: doc.Profiles?.username || null,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

/**
 * Get all documents uploaded by the current user
 */
export async function getMyDocuments(): Promise<DocumentWithDetails[]> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('documents')
      .select(
        `
        id,
        title,
        file_type,
        file_size,
        storage_path,
        created_at,
        updated_at,
        classroom_id,
        classes (class_name),
        Profiles (full_name, username)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return (
      data?.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        file_type: doc.file_type,
        file_size: doc.file_size,
        storage_path: doc.storage_path,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        classroom_id: doc.classroom_id,
        class_name: doc.classes?.class_name || null,
        owner_name: doc.Profiles?.full_name || null,
        owner_username: doc.Profiles?.username || null,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

/**
 * Get a signed URL for downloading a document
 */
export async function getDocumentDownloadUrl(
  storagePath: string
): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600) // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
}

/**
 * Delete a document (only if owner)
 */
export async function deleteDocument(documentId: string): Promise<{
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

        // Get document to verify ownership and get storage path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('user_id, storage_path, classroom_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return { success: false, error: 'Document not found' }
    }

    if (document.user_id !== user.id) {
      return { success: false, error: 'Not authorized to delete this document' }
    }

    // Delete from storage
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      return { success: false, error: `Database error: ${dbError.message}` }
    }

    revalidatePath('/docs')
    if (document.classroom_id) {
      revalidatePath(`/classes/${document.classroom_id}`)
    }

    // Invalidate AI cache for this class (fire and forget)
    if (document.class_id) {
      try {
        await invalidateAICache(document.class_id)
      } catch (cacheError) {
        // Don't fail the delete if cache invalidation fails
        console.warn('Failed to invalidate AI cache:', cacheError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}
