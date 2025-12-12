'use client'

import { api } from '@/trpc/react'
import { MatrixGrid } from '@/components/matrix/matrix-grid'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function MatrixPage() {
  const router = useRouter()
  const utils = api.useUtils()
  const { data: ideas, isLoading, error, refetch } = api.idea.list.useQuery()

  const updatePositionMutation = api.idea.updatePosition.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate()
      toast.success('Idea position updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update idea position')
      utils.idea.list.invalidate() // Revert to server state
    },
  })

  const handleCreateIdea = () => {
    router.push('/ideas')
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleIdeaMove = (ideaId: string, newEffort: number, newBusinessValue: number) => {
    updatePositionMutation.mutate({
      id: ideaId,
      effort: newEffort,
      businessValue: newBusinessValue,
    })
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error loading ideas: {error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impact Matrix</h1>
          <p className="text-muted-foreground mt-1">
            Visualize and prioritize your ideas based on effort vs. business value
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateIdea}>
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center" style={{ height: 800 }}>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading matrix...</p>
          </div>
        </div>
      ) : ideas && ideas.length > 0 ? (
        <div className="flex flex-col items-center">
          <MatrixGrid ideas={ideas} onIdeaMove={handleIdeaMove} />
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">No ideas yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first idea to see it on the matrix
          </p>
          <Button onClick={handleCreateIdea}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first idea
          </Button>
        </div>
      )}

      {/* Legend */}
      {ideas && ideas.length > 0 && (
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">How to use the matrix</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-green-500/5 border-green-500/20 p-4">
              <h3 className="font-semibold text-green-700 mb-1">Quick Wins</h3>
              <p className="text-sm text-muted-foreground">
                Low effort, high value. These are your best opportunities - prioritize them!
              </p>
            </div>
            <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
              <h3 className="font-semibold text-blue-700 mb-1">Major Projects</h3>
              <p className="text-sm text-muted-foreground">
                High effort, high value. Important initiatives that need careful planning and
                resources.
              </p>
            </div>
            <div className="rounded-lg border bg-yellow-500/5 border-yellow-500/20 p-4">
              <h3 className="font-semibold text-yellow-700 mb-1">Fill-Ins</h3>
              <p className="text-sm text-muted-foreground">
                Low effort, low value. Do these when you have spare time or capacity.
              </p>
            </div>
            <div className="rounded-lg border bg-red-500/5 border-red-500/20 p-4">
              <h3 className="font-semibold text-red-700 mb-1">Thankless Tasks</h3>
              <p className="text-sm text-muted-foreground">
                High effort, low value. Question whether these are worth doing at all.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
