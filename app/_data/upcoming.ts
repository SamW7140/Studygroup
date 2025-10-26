export interface UpcomingItem {
  id: string
  title: string
  type: 'assignment' | 'exam' | 'quiz' | 'project' | 'reading'
  classId: string
  className: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
}

export const upcomingItems: UpcomingItem[] = [
  {
    id: '1',
    title: 'Algorithm Analysis Homework',
    type: 'assignment',
    classId: '1',
    className: 'CMPSC 461',
    dueDate: new Date('2025-10-28T23:59:00'),
    priority: 'high',
  },
  {
    id: '2',
    title: 'Midterm Exam',
    type: 'exam',
    classId: '2',
    className: 'Math 230',
    dueDate: new Date('2025-10-30T14:00:00'),
    priority: 'high',
  },
  {
    id: '3',
    title: 'Chapter 6 Reading',
    type: 'reading',
    classId: '3',
    className: 'ECON 411',
    dueDate: new Date('2025-10-27T09:00:00'),
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Group Project Presentation',
    type: 'project',
    classId: '1',
    className: 'CMPSC 461',
    dueDate: new Date('2025-11-05T10:30:00'),
    priority: 'high',
  },
  {
    id: '5',
    title: 'Quiz on Derivatives',
    type: 'quiz',
    classId: '2',
    className: 'Math 230',
    dueDate: new Date('2025-10-26T11:00:00'),
    priority: 'medium',
  },
]
