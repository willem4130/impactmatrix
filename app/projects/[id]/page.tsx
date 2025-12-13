'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ImpactMatrix } from '@prisma/client'
import { Plus, FolderKanban, Grid3x3, Pencil, Trash2, Lightbulb, Tag } from 'lucide-react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const matrixSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type MatrixFormData = z.infer<typeof matrixSchema>

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMatrix, setEditingMatrix] = useState<ImpactMatrix | null>(null)

  const utils = api.useUtils()

  const { data: project, isLoading, error } = api.project.get.useQuery({ id: projectId })

  const createMutation = api.impactMatrix.create.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ id: projectId })
      setIsDialogOpen(false)
      reset({ name: '', description: '' })
      toast.success('Impact matrix created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create matrix')
    },
  })

  const updateMutation = api.impactMatrix.update.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ id: projectId })
      setIsDialogOpen(false)
      setEditingMatrix(null)
      toast.success('Impact matrix updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update matrix')
    },
  })

  const deleteMutation = api.impactMatrix.delete.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ id: projectId })
      toast.success('Impact matrix deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete matrix')
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MatrixFormData>({
    resolver: zodResolver(matrixSchema),
  })

  const handleCreateNew = () => {
    setEditingMatrix(null)
    reset({ name: '', description: '' })
    setIsDialogOpen(true)
  }

  const handleEdit = (matrix: ImpactMatrix) => {
    setEditingMatrix(matrix)
    reset({
      name: matrix.name,
      description: matrix.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const onSubmit = (data: MatrixFormData) => {
    if (editingMatrix) {
      updateMutation.mutate({
        id: editingMatrix.id,
        projectId,
        ...data,
      })
    } else {
      createMutation.mutate({
        projectId,
        ...data,
      })
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error loading project: {error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Project not found</p>
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
              <Link href={`/organizations/${project.organizationId}`}>
                {project.organization.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <FolderKanban className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Impact Matrix
        </Button>
      </div>

      {project.matrices && project.matrices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {project.matrices.map((matrix) => (
            <div key={matrix.id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Grid3x3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{matrix.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        {matrix._count.ideas} ideas
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {matrix._count.categories} categories
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(matrix)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete impact matrix?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{matrix.name}" and all its ideas and categories.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(matrix.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {matrix.description && (
                <p className="text-sm text-muted-foreground mb-4">{matrix.description}</p>
              )}

              <div className="flex gap-2">
                <Link href={`/matrix/${matrix.id}`} className="flex-1">
                  <Button variant="default" className="w-full">
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    View Matrix
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">No impact matrices yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first impact matrix in this project
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first matrix
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingMatrix ? 'Edit' : 'Create'} Impact Matrix</DialogTitle>
              <DialogDescription>
                {editingMatrix
                  ? 'Update the matrix details.'
                  : 'Create a new impact matrix for prioritizing ideas.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register('name')} placeholder="Q1 2025 Initiatives" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of this matrix"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingMatrix
                  ? 'Update'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
