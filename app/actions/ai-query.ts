'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface AIQueryRequest {
  classId: string
  question: string
}

interface AISource {
  file_name: string
  page?: number
  relevance_score?: number
}

interface AIQueryResponse {
  answer: string
  sources: AISource[]
  confidence?: number
}

/**
 * Query the AI service to answer questions about class documents
 * 
 * @param data - Contains classId and question
 * @returns AI-generated answer with sources
 */
export async function queryAI(data: AIQueryRequest): Promise<AIQueryResponse> {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to use AI features')
    }
    
    // TODO: Verify user has access to this class when class_members table is added
    // For now, allow all authenticated users to query
    
    // Call the AI service
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${AI_SERVICE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class_id: data.classId,
        question: data.question,
        user_id: user.id,
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI service error: ${errorText}`)
    }
    
    const result: AIQueryResponse = await response.json()
    return result
    
  } catch (error) {
    console.error('Error querying AI:', error)
    throw error
  }
}

/**
 * Invalidate the AI vector store cache for a class
 * (Call this when documents are added/removed)
 */
export async function invalidateAICache(classId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }
    
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${AI_SERVICE_URL}/invalidate-cache/${classId}`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error('Failed to invalidate cache')
    }
  } catch (error) {
    console.error('Error invalidating AI cache:', error)
    throw error
  }
}
