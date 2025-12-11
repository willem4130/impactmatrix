'use client'

import { useState } from 'react'
import { Category } from '@prisma/client'
import { Plus } from 'lucide-react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { CategoryCard } from '@/components/categories/category-card'
import { CategoryFormDialog } from '@/components/categories/category-form-dialog'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const utils = api.useUtils()
  const { data: categories, isLoading, error } = api.category.list.useQuery()

  const createMutation = api.category.create.useMutation({
    onSuccess: () => {
      utils.category.list.invalidate()
      setIsDialogOpen(false)
      toast.success('Category created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category')
    },
  })

  const updateMutation = api.category.update.useMutation({
    onSuccess: () => {
      utils.category.list.invalidate()
      setIsDialogOpen(false)
      setEditingCategory(null)
      toast.success('Category updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category')
    },
  })

  const deleteMutation = api.category.delete.useMutation({
    onSuccess: () => {
      utils.category.list.invalidate()
      toast.success('Category deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category')
    },
  })

  const handleCreateNew = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const handleSubmit = (data: { name: string; description?: string; color: string }) => {
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        ...data,
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingCategory(null)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error loading categories: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your ideas into categories for better management
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">No categories yet</p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first category
          </Button>
        </div>
      )}

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        category={editingCategory}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
