import { HeroSearch } from '@/components/dashboard/hero-search'
import { ActionTiles } from '@/components/dashboard/action-tiles'
import { FilterableDocumentsGrid } from '@/components/documents/filterable-documents-grid'
import { getAllEnrolledDocuments } from '@/app/actions/documents'
import { getAllClasses } from '@/app/actions/classes'

export default async function DashboardPage() {
  // Fetch real data from Supabase
  const [documents, classes] = await Promise.all([
    getAllEnrolledDocuments({ limit: 50 }),
    getAllClasses(),
  ])

  return (
    <div className="space-y-8">
      {/* Hero Section with Class Code Entry */}
      <HeroSearch />

      {/* Action Tiles - Simplified to core features */}
      <ActionTiles />

      {/* Class Materials Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Class Materials</h2>
            <p className="text-sm text-slate-400">Shared notes and documents from your classmates</p>
          </div>
        </div>

        {/* Documents Grid with Filtering */}
        <FilterableDocumentsGrid 
          documents={documents} 
          classes={classes.map(c => ({
            class_id: c.class_id,
            class_name: c.class_name
          }))}
        />
      </div>
    </div>
  )
}
