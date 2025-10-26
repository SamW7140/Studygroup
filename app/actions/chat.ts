'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { invalidateAICache } from './ai-query'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: {
    file_name: string
    page?: number
    relevance_score?: number
  }[]
  created_at: string
}

interface ChatSession {
  id: string
  class_id: string
  class_name: string
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

interface CreateChatSessionData {
  classId: string
  initialMessage?: string
}

interface SendMessageData {
  sessionId: string
  message: string
}

/**
 * Get all chat sessions for the current user
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to view chat sessions')
    }

    // For now, we'll return a mock array since we don't have the chat tables yet
    // TODO: Once migrations are run, query from chat_sessions table
    return []
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    throw error
  }
}

/**
 * Get recent chat sessions for sidebar (limited)
 */
export async function getRecentChatSessions(limit: number = 6): Promise<ChatSession[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    // For now, we'll return a mock array since we don't have the chat tables yet
    // TODO: Once migrations are run, query from chat_sessions table with limit and order by updated_at
    return []
  } catch (error) {
    console.error('Error fetching recent chat sessions:', error)
    return []
  }
}

/**
 * Get a specific chat session with all messages
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to view chat sessions')
    }

    // TODO: Query from database once migrations are run
    return null
  } catch (error) {
    console.error('Error fetching chat session:', error)
    throw error
  }
}

/**
 * Create a new chat session for a class
 */
export async function createChatSession(data: CreateChatSessionData): Promise<ChatSession> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to create a chat session')
    }

    // Verify class exists and user has access
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id, class_name')
      .eq('class_id', data.classId)
      .single()
    
    if (classError || !classData) {
      throw new Error('Class not found or you do not have access to it')
    }

    // TODO: Once migrations are run, insert into chat_sessions table
    // For now, return a mock session
    const mockSession: ChatSession = {
      id: `session-${Date.now()}`,
      class_id: data.classId,
      class_name: classData.class_name || 'Unknown Class',
      title: data.initialMessage ? data.initialMessage.substring(0, 50) + '...' : 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    }

    return mockSession
  } catch (error) {
    console.error('Error creating chat session:', error)
    throw error
  }
}

/**
 * Send a message in a chat session and get AI response
 */
export async function sendChatMessage(data: SendMessageData) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to send messages')
    }

    // TODO: Query session from database to get class_id
    // For now, we'll need to pass class_id directly or store in session
    
    // This is a placeholder - in a real implementation, we'd:
    // 1. Store the user message in chat_messages table
    // 2. Call the AI service
    // 3. Store the AI response in chat_messages table
    // 4. Return both messages

    return {
      success: true,
      userMessage: {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content: data.message,
        created_at: new Date().toISOString()
      },
      assistantMessage: null // Will be populated after AI response
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Query AI with context from a specific class
 * Enhanced version with better error handling and response formatting
 */
export async function queryAIWithContext(classId: string, question: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to use AI features')
    }
    
    // Verify class exists and user has access
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id, class_name')
      .eq('class_id', classId)
      .single()
    
    if (classError || !classData) {
      throw new Error('Class not found or you do not have access to it')
    }

    // Check if class has any documents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id')
      .eq('class_id', classId)
      .limit(1)

    if (docsError || !documents || documents.length === 0) {
      return {
        success: false,
        error: 'No documents found for this class. Please upload some study materials first.',
        answer: '',
        sources: []
      }
    }
    
    // Call the AI service
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
    
    console.log('🤖 Querying AI service:', {
      url: AI_SERVICE_URL,
      classId,
      question: question.substring(0, 50) + '...',
      userId: user.id
    })
    
    let response
    try {
      response = await fetch(`${AI_SERVICE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: classId,
          question: question,
          user_id: user.id,
        }),
        // Increased timeout for first-time document indexing
        signal: AbortSignal.timeout(120000) // 2 minute timeout for large document processing
      })
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            error: 'The AI is taking longer than expected to process your documents. This usually happens on the first query when documents are being indexed. Please wait a moment and try again - subsequent queries will be much faster (2-5 seconds).',
            answer: '',
            sources: []
          }
        }
        
        if (fetchError.message.includes('fetch') || fetchError.message.includes('ECONNREFUSED')) {
          return {
            success: false,
            error: 'Unable to connect to AI service. Please make sure the AI service is running on port 8000.',
            answer: '',
            sources: []
          }
        }
      }
      
      throw fetchError
    }
    
    console.log('📡 AI service response status:', response.status)
    
    if (!response.ok) {
      let errorText = await response.text()
      console.error('❌ AI service error response:', errorText)
      
      // Try to parse error details
      let errorDetail = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetail = errorJson.detail || errorText
      } catch {
        // Not JSON, use as is
      }
      
      if (response.status === 404) {
        return {
          success: false,
          error: 'No documents found in the AI index. This might be the first query - please wait while we index your documents and try again.',
          answer: '',
          sources: []
        }
      }
      
      if (response.status === 500) {
        // Parse the actual error from the detail
        if (errorDetail.includes('no rows returned')) {
          return {
            success: false,
            error: 'No documents found for this class. Please upload some study materials first.',
            answer: '',
            sources: []
          }
        }
        
        if (errorDetail.includes('invalid input syntax') || errorDetail.includes('uuid')) {
          return {
            success: false,
            error: 'Invalid class ID. Please try refreshing the page.',
            answer: '',
            sources: []
          }
        }
        
        return {
          success: false,
          error: `AI service error: ${errorDetail.substring(0, 100)}`,
          answer: '',
          sources: []
        }
      }
      
      return {
        success: false,
        error: `Unexpected error (${response.status}): ${errorDetail.substring(0, 100)}`,
        answer: '',
        sources: []
      }
    }
    
    const result = await response.json()
    
    console.log('✅ AI service response:', {
      answerLength: result.answer?.length || 0,
      sourcesCount: result.sources?.length || 0,
      confidence: result.confidence,
      answer: result.answer?.substring(0, 100) + '...'
    })
    
    return {
      success: true,
      answer: result.answer,
      sources: result.sources || [],
      confidence: result.confidence,
      className: classData.class_name
    }
    
  } catch (error) {
    console.error('❌ Unexpected error querying AI:', error)
    
    if (error instanceof Error) {
      // Log full error for debugging
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 200)
      })
      
      return {
        success: false,
        error: `An unexpected error occurred: ${error.message}`,
        answer: '',
        sources: []
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred while querying the AI. Please check the console for details.',
      answer: '',
      sources: []
    }
  }
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<{ success: boolean }> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to delete chat sessions')
    }

    // TODO: Once migrations are run, delete from chat_sessions table
    // The cascade will delete all messages
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting chat session:', error)
    throw error
  }
}

/**
 * Update chat session title
 */
export async function updateChatSessionTitle(
  sessionId: string, 
  title: string
): Promise<{ success: boolean }> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to update chat sessions')
    }

    // TODO: Once migrations are run, update chat_sessions table
    
    return { success: true }
  } catch (error) {
    console.error('Error updating chat session:', error)
    throw error
  }
}

/**
 * Trigger document reindexing for a class
 * Call this after documents are uploaded, updated, or deleted
 */
export async function triggerDocumentIndexing(classId: string): Promise<{ success: boolean }> {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('Cannot trigger indexing: user not authenticated')
      return { success: false }
    }

    // Verify user has access to the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('class_id', classId)
      .single()
    
    if (classError || !classData) {
      console.warn('Cannot trigger indexing: class not found or no access')
      return { success: false }
    }

    // Invalidate the AI cache so documents get reindexed on next query
    await invalidateAICache(classId)
    
    return { success: true }
  } catch (error) {
    console.error('Error triggering document indexing:', error)
    return { success: false }
  }
}
