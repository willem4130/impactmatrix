'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { MatrixGrid } from '@/components/matrix/matrix-grid'
import { MatrixFilters } from '@/components/matrix/matrix-filters'
import { IdeasSidePanel } from '@/components/matrix/ideas-side-panel'
import { IdeaFormDialog } from '@/components/ideas/idea-form-dialog'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Plus, RefreshCw, List, Tag, PanelRight, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Idea, IdeaStatus, Category } from '@prisma/client'
import type { IdeaWithCategory } from '@/lib/filter-utils'

export default function MatrixPage() {
  const params = useParams()
  const router = useRouter()
  const matrixId = params.id as string
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaWithCategory[]>([])

  const utils = api.useUtils()

  const { data: matrix, isLoading: matrixLoading, error: matrixError } = api.impactMatrix.get.useQuery({ id: matrixId })
  const { data: ideas, isLoading: ideasLoading, error: ideasError, refetch } = api.idea.list.useQuery({ impactMatrixId: matrixId })
  const { data: categories } = api.category.list.useQuery({ impactMatrixId: matrixId })

  // Update filtered ideas when source ideas change
  useEffect(() => {
    setFilteredIdeas(ideas || [])
  }, [ideas])

  const updatePositionMutation = api.idea.updatePosition.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      toast.success('Idea position updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update idea position')
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
    },
  })

  const updateCustomPositionMutation = api.idea.updateCustomPosition.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update position')
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
    },
  })

  const updateIdeaMutation = api.idea.update.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      toast.success('Idea updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update idea')
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
    },
  })

  const createIdeaMutation = api.idea.create.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      setIsCreateDialogOpen(false)
      toast.success('Idea created')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create idea')
    },
  })

  const resetPositionMutation = api.idea.resetPosition.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      toast.success('Position reset')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset position')
    },
  })

  const resetAllPositionsMutation = api.idea.resetAllPositions.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      toast.success('All positions reset')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset positions')
    },
  })

  const handleRefresh = () => {
    refetch()
  }

  const handleCreateIdea = (data: {
    title: string
    description?: string
    effort: number
    businessValue: number
    weight: number
    categoryId?: string
    status: IdeaStatus
  }) => {
    createIdeaMutation.mutate({
      ...data,
      impactMatrixId: matrixId,
    })
  }

  const handleIdeaMove = (ideaId: string, newEffort: number, newBusinessValue: number) => {
    updatePositionMutation.mutate({
      id: ideaId,
      effort: newEffort,
      businessValue: newBusinessValue,
    })
  }

  const handleCustomPosition = (ideaId: string, positionX: number, positionY: number) => {
    updateCustomPositionMutation.mutate({
      id: ideaId,
      positionX,
      positionY,
    })
  }

  const handleIdeaUpdate = (ideaId: string, newEffort: number, newBusinessValue: number, newWeight: number) => {
    const idea = ideas?.find((i) => i.id === ideaId)
    const hasCustomPosition = idea?.positionX !== null || idea?.positionY !== null
    const effortChanged = idea && idea.effort !== newEffort
    const businessValueChanged = idea && idea.businessValue !== newBusinessValue

    // Clear custom position if effort or businessValue changed
    // This ensures the card moves to the new grid position
    if (hasCustomPosition && (effortChanged || businessValueChanged)) {
      updateIdeaMutation.mutate({
        id: ideaId,
        effort: newEffort,
        businessValue: newBusinessValue,
        weight: newWeight,
      }, {
        onSuccess: () => {
          // After updating scores, reset position to match new grid location
          resetPositionMutation.mutate({ id: ideaId })
        }
      })
    } else {
      updateIdeaMutation.mutate({
        id: ideaId,
        effort: newEffort,
        businessValue: newBusinessValue,
        weight: newWeight,
      })
    }
  }

  const handleResetPosition = (ideaId: string) => {
    resetPositionMutation.mutate({ id: ideaId })
  }

  const handleResetAllPositions = () => {
    resetAllPositionsMutation.mutate({ impactMatrixId: matrixId })
  }

  const isLoading = matrixLoading || ideasLoading
  const error = matrixError || ideasError

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error loading matrix: {error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (matrixLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Loading matrix...</p>
        </div>
      </div>
    )
  }

  if (!matrix) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Matrix not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/organizations/${matrix.project.organizationId}`}>
                {matrix.project.organization.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/projects/${matrix.projectId}`}>
                {matrix.project.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{matrix.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{matrix.name}</h1>
          {matrix.description && (
            <p className="text-muted-foreground mt-1">{matrix.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Button>
          <Button variant="outline" onClick={() => setShowSidePanel(!showSidePanel)}>
            <PanelRight className="mr-2 h-4 w-4" />
            {showSidePanel ? 'Hide' : 'Show'} Ideas Panel
          </Button>
          <Link href={`/matrix/${matrixId}/ideas`}>
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              Ideas List
            </Button>
          </Link>
          <Link href={`/matrix/${matrixId}/categories`}>
            <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleResetAllPositions}
            disabled={resetAllPositionsMutation.isPending}
            title="Reset all ideas to grid positions"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All Positions
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {ideasLoading ? (
        <div className="flex items-center justify-center" style={{ height: 800 }}>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading ideas...</p>
          </div>
        </div>
      ) : ideas && ideas.length > 0 ? (
        <>
          <MatrixFilters
            ideas={ideas}
            categories={categories || []}
            impactMatrixId={matrixId}
            onFilterChange={setFilteredIdeas}
          />

          <div className="flex flex-col items-center">
            <MatrixGrid
              ideas={filteredIdeas}
              onIdeaMove={handleIdeaMove}
              onCustomPosition={handleCustomPosition}
              onIdeaUpdate={handleIdeaUpdate}
              onResetPosition={handleResetPosition}
            />
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredIdeas.length} of {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
                {filteredIdeas.length < ideas.length && (
                  <span className="ml-1">({ideas.length - filteredIdeas.length} filtered out)</span>
                )}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">No ideas yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first idea to see it on the matrix
          </p>
          <Link href={`/matrix/${matrixId}/ideas`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create your first idea
            </Button>
          </Link>
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

      {/* Ideas Side Panel */}
      {showSidePanel && ideas && (
        <IdeasSidePanel ideas={filteredIdeas} matrixId={matrixId} onClose={() => setShowSidePanel(false)} />
      )}

      {/* Create Idea Dialog */}
      <IdeaFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateIdea}
        isLoading={createIdeaMutation.isPending}
        impactMatrixId={matrixId}
      />
    </div>
  )
}
