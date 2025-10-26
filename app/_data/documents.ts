/**
 * Document Interface (Frontend Model)
 * 
 * Database Mapping to Supabase:
 * - 'id' maps to documents.id (uuid)
 * - 'title' maps to documents.title (text)
 * - 'type' should be stored as a flag with type='FileType'
 * - 'classId' / 'className' are derived from flags with type='Class' via document_flags
 * - 'owner' maps to profiles.username (joined via documents.user_id)
 * - 'lastEdited' maps to documents.created_at (or add updated_at column)
 * - 'thumbnail', 'size', 'tags' are derived or computed fields
 * 
 * To fetch from Supabase:
 * 1. Get document from documents table
 * 2. Join with profiles to get owner username
 * 3. Join with document_flags and flags to get class, type, and tags
 * 4. Use storage.from('documents').getPublicUrl() for thumbnail if needed
 */
export interface Document {
  id: string
  title: string
  type: 'pdf' | 'pptx' | 'docx' | 'png' | 'jpg' | 'xlsx'
  classId: string
  className: string
  owner: string
  lastEdited: Date
  thumbnail?: string
  size?: string
  tags?: string[]
}

export const documents: Document[] = [
  {
    id: '1',
    title: 'Algorithm Analysis Notes',
    type: 'pdf',
    classId: '1',
    className: 'CMPSC 461',
    owner: 'John Doe',
    lastEdited: new Date('2025-10-24T14:30:00'),
    size: '2.4 MB',
    tags: ['lecture', 'notes'],
  },
  {
    id: '2',
    title: 'Data Structures Presentation',
    type: 'pptx',
    classId: '1',
    className: 'CMPSC 461',
    owner: 'Sarah Smith',
    lastEdited: new Date('2025-10-23T16:20:00'),
    size: '5.1 MB',
    tags: ['presentation'],
  },
  {
    id: '3',
    title: 'Linear Algebra Homework',
    type: 'docx',
    classId: '2',
    className: 'Math 230',
    owner: 'Mike Johnson',
    lastEdited: new Date('2025-10-23T10:15:00'),
    size: '1.2 MB',
    tags: ['homework'],
  },
  {
    id: '4',
    title: 'Matrix Operations Diagram',
    type: 'png',
    classId: '2',
    className: 'Math 230',
    owner: 'Emily Chen',
    lastEdited: new Date('2025-10-22T14:00:00'),
    size: '850 KB',
    tags: ['diagram'],
  },
  {
    id: '5',
    title: 'Microeconomics Chapter 5',
    type: 'pdf',
    classId: '3',
    className: 'ECON 411',
    owner: 'David Lee',
    lastEdited: new Date('2025-10-25T09:00:00'),
    size: '3.2 MB',
    tags: ['reading', 'textbook'],
  },
  {
    id: '6',
    title: 'Supply & Demand Analysis',
    type: 'xlsx',
    classId: '3',
    className: 'ECON 411',
    owner: 'Lisa Wang',
    lastEdited: new Date('2025-10-24T11:30:00'),
    size: '640 KB',
    tags: ['analysis', 'data'],
  },
  {
    id: '7',
    title: 'Study Guide - Midterm',
    type: 'docx',
    classId: '1',
    className: 'CMPSC 461',
    owner: 'Alex Brown',
    lastEdited: new Date('2025-10-21T19:45:00'),
    size: '1.8 MB',
    tags: ['study guide', 'exam'],
  },
  {
    id: '8',
    title: 'Graph Theory Examples',
    type: 'pdf',
    classId: '1',
    className: 'CMPSC 461',
    owner: 'Rachel Green',
    lastEdited: new Date('2025-10-20T13:20:00'),
    size: '1.5 MB',
    tags: ['examples'],
  },
  {
    id: '9',
    title: 'Calculus Practice Problems',
    type: 'pdf',
    classId: '2',
    className: 'Math 230',
    owner: 'Tom Wilson',
    lastEdited: new Date('2025-10-19T15:30:00'),
    size: '2.1 MB',
    tags: ['practice', 'homework'],
  },
  {
    id: '10',
    title: 'Market Research Presentation',
    type: 'pptx',
    classId: '3',
    className: 'ECON 411',
    owner: 'Nina Patel',
    lastEdited: new Date('2025-10-18T10:00:00'),
    size: '4.8 MB',
    tags: ['presentation', 'research'],
  },
  {
    id: '11',
    title: 'Project Proposal Draft',
    type: 'docx',
    classId: '4',
    className: 'Time for skoo',
    owner: 'Chris Martin',
    lastEdited: new Date('2025-10-22T16:45:00'),
    size: '980 KB',
    tags: ['project', 'draft'],
  },
  {
    id: '12',
    title: 'Class Schedule Fall 2023',
    type: 'jpg',
    classId: '4',
    className: 'Time for skoo',
    owner: 'Jordan Lee',
    lastEdited: new Date('2025-10-17T12:00:00'),
    size: '720 KB',
    tags: ['schedule'],
  },
]
