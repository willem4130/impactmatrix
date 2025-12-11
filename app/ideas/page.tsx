'use client'

import { useState } from 'react'
import { Idea, IdeaStatus } from '@prisma/client'
import { Plus, Filter, X } from 'lucide-react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IdeasTable } from '@/components/ideas/ideas-table'
import { IdeaFormDialog } from '@/components/ideas/idea-form-dialog'
import { toast } from 'sonner'

const STATUS_LABELS: Record<IdeaStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

export default function IdeasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined)
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | undefined>(undefined)

  const utils = api.useUtils()

  const { data: ideas, isLoading, error } = api.idea.list.useQuery({
    categoryId: filterCategory,
    status: filterStatus,
  })

  const { data: categories } = api.category.list.useQuery()

  const createMutation = api.idea.create.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate()
      setIsDialogOpen(false)
      toast.success('Idea created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create idea')
    },
  })

  const updateMutation = api.idea.update.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate()
      setIsDialogOpen(false)
      setEditingIdea(null)
      toast.success('Idea updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update idea')
    },
  })

  const deleteMutation = api.idea.delete.useMutation({
    onSuccess: () => {
      utils.idea.list.invalidate()
      toast.success('Idea deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete idea')
    },
  })

  const handleCreateNew = () => {
    setEditingIdea(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const handleSubmit = (data: {
    title: string
    description?: string
    effort: number
    businessValue: number
    categoryId?: string
    status: IdeaStatus
  }) => {
    if (editingIdea) {
      updateMutation.mutate({
        id: editingIdea.id,
        ...data,
        categoryId: data.categoryId || null,
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingIdea(null)
    }
  }

  const handleClearFilters = () => {
    setFilterCategory(undefined)
    setFilterStatus(undefined)
  }

  const hasActiveFilters = filterCategory !== undefined || filterStatus !== undefined

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error loading ideas: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ideas</h1>
          <p className="text-muted-foreground mt-1">
            Manage your improvement ideas and track their progress
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Idea
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select
          value={filterCategory || ''}
          onValueChange={(value) => setFilterCategory(value === '' ? undefined : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterStatus || ''}
          onValueChange={(value) =>
            setFilterStatus(value === '' ? undefined : (value as IdeaStatus))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Ideas Table */}
      {isLoading ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Loading ideas...</p>
        </div>
      ) : ideas && ideas.length > 0 ? (
        <IdeasTable ideas={ideas} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters ? 'No ideas match your filters' : 'No ideas yet'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first idea
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      <IdeaFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        idea={editingIdea}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
