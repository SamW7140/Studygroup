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
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to use AI features')
    }
    
    // Verify class exists and user has access
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('class_id', data.classId)
      .single()
    
    if (classError || !classData) {
      throw new Error('Class not found or you do not have access to it')
    }
    
    // Call the AI service
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    
    const requestBody: any = {
      class_id: data.classId,
      question: data.question,
      user_id: user.id,
    }
    
    // TODO: Re-enable system_prompt after running database migration
    // Include system_prompt if the class has a custom one
    // if (classData?.system_prompt) {
    //   requestBody.system_prompt = classData.system_prompt
    // }
    
    const response = await fetch(`${AI_SERVICE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI service error:', errorText)
      throw new Error(`AI service error: ${response.status} - ${errorText}`)
    }
    
    const result: AIQueryResponse = await response.json()
    return result
    
  } catch (error) {
    console.error('Error querying AI:', error)
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to AI service. Please make sure the AI service is running.')
      }
      throw error
    }
    
    throw new Error('An unexpected error occurred while querying the AI')
  }
}

/**
 * Invalidate the AI vector store cache for a class
 * (Call this when documents are added/removed)
 */
export async function invalidateAICache(classId: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('Cannot invalidate cache: user not authenticated')
      return
    }
    
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${AI_SERVICE_URL}/invalidate-cache/${classId}`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`Failed to invalidate cache: ${errorText}`)
    } else {
      console.log(`Successfully invalidated AI cache for class ${classId}`)
    }
  } catch (error) {
    console.error('Error invalidating AI cache:', error)
    // Don't throw - cache invalidation is not critical
  }
}
