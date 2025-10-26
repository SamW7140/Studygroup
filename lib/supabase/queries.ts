/**
 * Supabase Database Queries
 * Helper functions for common database operations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  Document,
  DocumentWithFlags,
  Flag,
  FlagWithCount,
  Profile,
  DocumentInsert,
  FlagInsert,
  DocumentFlagInsert,
  ProfileInsert,
} from './types'

type TypedSupabaseClient = SupabaseClient<Database>

// ===========================
// Profile Queries
// ===========================

/**
 * Get profile by user ID
 */
export async function getProfile(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('Profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

/**
 * Create or update profile
 */
export async function upsertProfile(
  supabase: TypedSupabaseClient,
  profile: ProfileInsert
) {
  const { data, error } = await supabase
    .from('Profiles')
    .upsert(profile)
    .select()
    .single()

  return { data, error }
}

// ===========================
// Document Queries
// ===========================

/**
 * Get all documents for a user
 */
export async function getUserDocuments(
  supabase: TypedSupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Get a single document by ID
 */
export async function getDocument(
  supabase: TypedSupabaseClient,
  documentId: string
) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  return { data, error }
}

/**
 * Get document with its flags
 */
export async function getDocumentWithFlags(
  supabase: TypedSupabaseClient,
  documentId: string
): Promise<{ data: DocumentWithFlags | null; error: any }> {
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    return { data: null, error: docError }
  }

  // TODO: Implement flag relationships when flags table is created in database
  // Currently returning document without flags since the schema doesn't support it yet
  return { data: { ...document, flags: [] }, error: null }

  /* 
  // This code will work once the flags table and proper document_flags schema exists:
  const { data: documentFlags, error: flagsError } = await supabase
    .from('document_flags')
    .select('flag_id')
    .eq('document_id', documentId)

  if (flagsError) {
    return { data: null, error: flagsError }
  }

  if (!documentFlags || documentFlags.length === 0) {
    return { data: { ...document, flags: [] }, error: null }
  }

  const flagIds = documentFlags.map((df) => df.flag_id)
  const { data: flags, error: flagDetailsError } = await supabase
    .from('flags')
    .select('*')
    .in('id', flagIds)

  if (flagDetailsError) {
    return { data: null, error: flagDetailsError }
  }

  return { data: { ...document, flags: flags || [] }, error: null }
  */
}

/**
 * Create a new document
 */
export async function createDocument(
  supabase: TypedSupabaseClient,
  document: DocumentInsert
) {
  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select()
    .single()

  return { data, error }
}

/**
 * Update a document
 */
export async function updateDocument(
  supabase: TypedSupabaseClient,
  documentId: string,
  updates: Partial<Pick<Document, 'title' | 'extracted_text' | 'storage_path'>>
) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  supabase: TypedSupabaseClient,
  documentId: string
) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  return { error }
}

// ===========================
// Flag Queries
// NOTE: These functions are stubs because the database doesn't currently have a 'flags' table
// The schema has a 'classes' table instead. These will need to be reimplemented when the schema is updated.
// ===========================

/**
 * Get all flags for a user
 * TODO: Implement when flags table exists in database
 */
export async function getUserFlags(
  supabase: TypedSupabaseClient,
  userId: string
) {
  console.warn('getUserFlags: flags table does not exist in current database schema')
  return { data: null, error: { message: 'Flags table not implemented in database schema' } }
}

/**
 * Get flags by type (e.g., 'Class', 'Semester', 'Type')
 * TODO: Implement when flags table exists in database
 */
export async function getFlagsByType(
  supabase: TypedSupabaseClient,
  userId: string,
  type: string
) {
  console.warn('getFlagsByType: flags table does not exist in current database schema')
  return { data: null, error: { message: 'Flags table not implemented in database schema' } }
}

/**
 * Get flags with document count
 * TODO: Implement when flags table exists in database
 */
export async function getFlagsWithCount(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<{ data: FlagWithCount[] | null; error: any }> {
  console.warn('getFlagsWithCount: flags table does not exist in current database schema')
  return { data: null, error: { message: 'Flags table not implemented in database schema' } }
}

/**
 * Create a new flag
 * TODO: Implement when flags table exists in database
 */
export async function createFlag(
  supabase: TypedSupabaseClient,
  flag: FlagInsert
) {
  console.warn('createFlag: flags table does not exist in current database schema')
  return { data: null, error: { message: 'Flags table not implemented in database schema' } }
}

/**
 * Update a flag
 * TODO: Implement when flags table exists in database
 */
export async function updateFlag(
  supabase: TypedSupabaseClient,
  flagId: number,
  updates: Partial<Pick<Flag, 'name' | 'type'>>
) {
  console.warn('updateFlag: flags table does not exist in current database schema')
  return { data: null, error: { message: 'Flags table not implemented in database schema' } }
}

/**
 * Delete a flag
 * TODO: Implement when flags table exists in database
 */
export async function deleteFlag(supabase: TypedSupabaseClient, flagId: number) {
  console.warn('deleteFlag: flags table does not exist in current database schema')
  return { error: { message: 'Flags table not implemented in database schema' } }
}

// ===========================
// Document-Flag Relationship Queries
// NOTE: These are stubs because document_flags table is incomplete (missing flag_id column)
// ===========================

/**
 * Add a flag to a document
 * TODO: Implement when document_flags schema is complete
 */
export async function addFlagToDocument(
  supabase: TypedSupabaseClient,
  documentFlag: DocumentFlagInsert
) {
  console.warn('addFlagToDocument: document_flags table schema is incomplete')
  return { data: null, error: { message: 'document_flags table schema incomplete' } }
}

/**
 * Remove a flag from a document
 * TODO: Implement when document_flags schema is complete
 */
export async function removeFlagFromDocument(
  supabase: TypedSupabaseClient,
  documentId: string,
  flagId: number
) {
  console.warn('removeFlagFromDocument: document_flags table schema is incomplete')
  return { error: { message: 'document_flags table schema incomplete' } }
}

/**
 * Get all documents with a specific flag
 * TODO: Implement when document_flags schema is complete
 */
export async function getDocumentsByFlag(
  supabase: TypedSupabaseClient,
  flagId: number
): Promise<{ data: Document[] | null; error: any }> {
  console.warn('getDocumentsByFlag: document_flags table schema is incomplete')
  return { data: null, error: { message: 'document_flags table schema incomplete' } }
}

/**
 * Get all documents with multiple flags (AND condition)
 * TODO: Implement when document_flags schema is complete
 */
export async function getDocumentsByMultipleFlags(
  supabase: TypedSupabaseClient,
  flagIds: number[]
): Promise<{ data: Document[] | null; error: any }> {
  console.warn('getDocumentsByMultipleFlags: document_flags table schema is incomplete')
  return { data: null, error: { message: 'document_flags table schema incomplete' } }
}

// ===========================
// Search Queries
// ===========================

/**
 * Search documents by title or extracted text
 */
export async function searchDocuments(
  supabase: TypedSupabaseClient,
  userId: string,
  searchTerm: string
) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${searchTerm}%,extracted_text.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  return { data, error }
}
