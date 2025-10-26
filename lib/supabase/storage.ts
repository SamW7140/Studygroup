/**
 * Supabase Storage Utilities
 * Helper functions for file upload and management
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  return { data, error }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string
) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage.from(bucket).download(path)

  return { data, error }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage.from(bucket).remove([path])

  return { data, error }
}

/**
 * List files in a folder
 */
export async function listFiles(
  supabase: TypedSupabaseClient,
  bucket: string,
  folder?: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  return { data, error }
}
