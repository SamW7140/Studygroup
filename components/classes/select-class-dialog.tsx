'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { getAllClasses } from '@/app/actions/classes'
import type { ClassWithDetails } from '@/app/actions/classes'
import { toast } from 'sonner'

interface SelectClassDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (classId: string, className: string) => void
}

export function SelectClassDialog({ open, onClose, onSelect }: SelectClassDialogProps) {
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadClasses()
    }
  }, [open])

  const loadClasses = async () => {
    try {
      const classesData = await getAllClasses()
      console.log('Debug - Loaded classes:', classesData)
      setClasses(classesData)
    } catch (error) {
      console.error('Debug - Failed to load classes:', error)
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Select Class</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-slate-400">No classes found. Please join or create a class first.</p>
          ) : (
            <div className="grid gap-3">
              {classes.map((cls) => (
                <button
                  key={cls.class_id}
                  onClick={() => onSelect(cls.class_id, cls.class_name)}
                  className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-left group"
                >
                  <h3 className="text-white font-medium group-hover:text-orange-400 transition-colors">
                    {cls.class_name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {cls.document_count || 0} documents • {cls.enrollment_count || 0} students
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}