'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'

interface ClassContextProviderProps {
  classId: string
  className: string
  children: React.ReactNode
}

/**
 * Sets the current class context for the AI sidebar chat
 */
export function ClassContextProvider({ classId, className, children }: ClassContextProviderProps) {
  const setCurrentClass = useUIStore((state) => state.setCurrentClass)

  useEffect(() => {
    // Set class context when component mounts
    setCurrentClass(classId, className)

    // Clear context when component unmounts
    return () => {
      setCurrentClass(null, null)
    }
  }, [classId, className, setCurrentClass])

  return <>{children}</>
}
