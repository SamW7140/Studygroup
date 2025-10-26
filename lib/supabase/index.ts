/**
 * Supabase Module Exports
 * Central export point for all Supabase-related utilities
 */

// Client exports
export { createClient, getSupabaseClient } from './client'
export { createServerSupabaseClient } from './server'

// Type exports
export type {
  Database,
  Profile,
  Document,
  Flag,
  DocumentFlag,
  DocumentWithFlags,
  ProfileWithDocuments,
  FlagWithCount,
  ProfileInsert,
  DocumentInsert,
  FlagInsert,
  DocumentFlagInsert,
  ProfileUpdate,
  DocumentUpdate,
  FlagUpdate,
} from './types'

// Query exports
export {
  // Profile queries
  getProfile,
  upsertProfile,
  // Document queries
  getUserDocuments,
  getDocument,
  getDocumentWithFlags,
  createDocument,
  updateDocument,
  deleteDocument,
  // Flag queries
  getUserFlags,
  getFlagsByType,
  getFlagsWithCount,
  createFlag,
  updateFlag,
  deleteFlag,
  // Relationship queries
  addFlagToDocument,
  removeFlagFromDocument,
  getDocumentsByFlag,
  getDocumentsByMultipleFlags,
  // Search queries
  searchDocuments,
} from './queries'
