'use client'

import { useState } from 'react'
import { Idea, Category, IdeaStatus } from '@prisma/client'
import { X, ExternalLink, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { IdeaFormDialog } from '@/components/ideas/idea-form-dialog'
import Link from 'next/link'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface IdeasSidePanelProps {
  ideas: IdeaWithCategory[]
  matrixId: string
  onClose: () => void
}

export function IdeasSidePanel({ ideas, matrixId, onClose }: IdeasSidePanelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<IdeaWithCategory | null>(null)
  const [deletingIdea, setDeletingIdea] = useState<IdeaWithCategory | null>(null)

  const utils = api.useUtils()

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

  const updateIdeaMutation = api.idea.update.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      setEditingIdea(null)
      toast.success('Idea updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update idea')
    },
  })

  const deleteIdeaMutation = api.idea.delete.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate({ impactMatrixId: matrixId })
      setDeletingIdea(null)
      toast.success('Idea deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete idea')
    },
  })

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

  const handleUpdateIdea = (data: {
    title: string
    description?: string
    effort: number
    businessValue: number
    weight: number
    categoryId?: string
    status: IdeaStatus
  }) => {
    if (!editingIdea) return
    updateIdeaMutation.mutate({
      id: editingIdea.id,
      ...data,
    })
  }

  const handleDeleteIdea = () => {
    if (!deletingIdea) return
    deleteIdeaMutation.mutate({ id: deletingIdea.id })
  }

  const getQuadrantColor = (effort: number, businessValue: number) => {
    const isHighEffort = effort > 5
    const isHighValue = businessValue > 5

    if (isHighValue && !isHighEffort) return 'bg-green-500/10 border-green-500/30 text-green-700'
    if (isHighValue && isHighEffort) return 'bg-blue-500/10 border-blue-500/30 text-blue-700'
    if (!isHighValue && !isHighEffort) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700'
    return 'bg-red-500/10 border-red-500/30 text-red-700'
  }

  const getQuadrantLabel = (effort: number, businessValue: number) => {
    const isHighEffort = effort > 5
    const isHighValue = businessValue > 5

    if (isHighValue && !isHighEffort) return 'Quick Win'
    if (isHighValue && isHighEffort) return 'Major Project'
    if (!isHighValue && !isHighEffort) return 'Fill-In'
    return 'Thankless Task'
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    // Sort by business value (descending), then by effort (ascending)
    if (b.businessValue !== a.businessValue) {
      return b.businessValue - a.businessValue
    }
    return a.effort - b.effort
  })

  return (
    <>
      <div className="fixed right-0 top-0 h-screen w-80 border-l bg-background shadow-xl z-50 flex flex-col">
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-lg font-semibold">Ideas ({ideas.length})</h2>
              <p className="text-xs text-muted-foreground">Sorted by priority</p>
            </div>
            <div className="flex gap-1">
              <Link href={`/matrix/${matrixId}/ideas`}>
                <Button variant="ghost" size="icon" title="Open full view">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Idea
            </Button>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {sortedIdeas.length > 0 ? (
            sortedIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`rounded-lg border-2 p-3 space-y-2 transition-all hover:shadow-md ${getQuadrantColor(idea.effort, idea.businessValue)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-tight flex-1">{idea.title}</h3>
                  <div className="flex items-center gap-1">
                    {idea.category && (
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0 ring-1 ring-white/20"
                        style={{ backgroundColor: idea.category.color }}
                        title={idea.category.name}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingIdea(idea)}
                      title="Edit idea"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setDeletingIdea(idea)}
                      title="Delete idea"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>

                {idea.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {idea.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      E:{idea.effort}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      V:{idea.businessValue}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      W:{idea.weight}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                    {getQuadrantLabel(idea.effort, idea.businessValue)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No ideas yet</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Create Idea Dialog */}
      <IdeaFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateIdea}
        isLoading={createIdeaMutation.isPending}
        impactMatrixId={matrixId}
      />

      {/* Edit Idea Dialog */}
      <IdeaFormDialog
        open={!!editingIdea}
        onOpenChange={(open) => !open && setEditingIdea(null)}
        idea={editingIdea}
        onSubmit={handleUpdateIdea}
        isLoading={updateIdeaMutation.isPending}
        impactMatrixId={matrixId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingIdea} onOpenChange={(open) => !open && setDeletingIdea(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingIdea?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIdea}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteIdeaMutation.isPending}
            >
              {deleteIdeaMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
