/**
 * Class Interface (Frontend Model)
 * 
 * NOTE: In the database, classes are represented as FLAGS with type='Class'
 * This interface is for the frontend display layer only.
 * 
 * Database Mapping:
 * - Classes are stored in the 'flags' table with type='Class'
 * - Additional metadata (professor, members, etc.) may need separate tables
 *   or be stored as JSON in a future implementation
 * - Documents are linked to classes via the document_flags junction table
 * 
 * Migration Path:
 * 1. Create flags with type='Class' for each class
 * 2. Store class metadata separately or extend the flags table
 * 3. Link documents to class flags via document_flags table
 */
export interface Class {
  id: string
  name: string
  professor: string
  members: number
  joinCode: string
  lastActivity: Date
  color: string
  avatar?: string
}

export const classes: Class[] = [
  {
    id: '1',
    name: 'CMPSC 461',
    professor: 'Dr. Sarah Johnson',
    members: 45,
    joinCode: 'CS461-F23',
    lastActivity: new Date('2025-10-24T14:30:00'),
    color: '#4f46e5',
  },
  {
    id: '2',
    name: 'Math 230',
    professor: 'Prof. Michael Chen',
    members: 38,
    joinCode: 'MATH230-A',
    lastActivity: new Date('2025-10-23T10:15:00'),
    color: '#22d3ee',
  },
  {
    id: '3',
    name: 'ECON 411',
    professor: 'Dr. Emily Rodriguez',
    members: 52,
    joinCode: 'ECON411-B',
    lastActivity: new Date('2025-10-25T09:00:00'),
    color: '#f59e0b',
  },
  {
    id: '4',
    name: 'Time for skoo',
    professor: 'Prof. Alex Thompson',
    members: 28,
    joinCode: 'SKOO-2023',
    lastActivity: new Date('2025-10-22T16:45:00'),
    color: '#ec4899',
  },
]
