'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Idea, IdeaStatus } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/trpc/react'

const ideaFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  effort: z.number().int().min(1).max(10),
  businessValue: z.number().int().min(1).max(10),
  categoryId: z.string().optional(),
  status: z.nativeEnum(IdeaStatus),
})

type IdeaFormData = z.infer<typeof ideaFormSchema>

interface IdeaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea?: Idea | null
  onSubmit: (data: IdeaFormData) => void
  isLoading?: boolean
}

const STATUS_LABELS: Record<IdeaStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

export function IdeaFormDialog({
  open,
  onOpenChange,
  idea,
  onSubmit,
  isLoading,
}: IdeaFormDialogProps) {
  const { data: categories } = api.category.list.useQuery()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: idea?.title || '',
      description: idea?.description || '',
      effort: idea?.effort || 5,
      businessValue: idea?.businessValue || 5,
      categoryId: idea?.categoryId || undefined,
      status: idea?.status || IdeaStatus.DRAFT,
    },
  })

  const selectedCategoryId = watch('categoryId')
  const selectedStatus = watch('status')
  const effortValue = watch('effort')
  const businessValue = watch('businessValue')

  useEffect(() => {
    if (idea) {
      reset({
        title: idea.title,
        description: idea.description || '',
        effort: idea.effort,
        businessValue: idea.businessValue,
        categoryId: idea.categoryId || undefined,
        status: idea.status,
      })
    } else {
      reset({
        title: '',
        description: '',
        effort: 5,
        businessValue: 5,
        categoryId: undefined,
        status: IdeaStatus.DRAFT,
      })
    }
  }, [idea, reset])

  const handleFormSubmit = (data: IdeaFormData) => {
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{idea ? 'Edit Idea' : 'Create Idea'}</DialogTitle>
          <DialogDescription>
            {idea
              ? 'Update the idea details below.'
              : 'Add a new improvement idea to your matrix.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Improve checkout flow"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your idea in detail..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effort">
                Effort: {effortValue}
                <span className="ml-2 text-xs text-muted-foreground">
                  (1=Low, 10=High)
                </span>
              </Label>
              <Input
                id="effort"
                type="range"
                min="1"
                max="10"
                step="1"
                value={effortValue}
                onChange={(e) => setValue('effort', parseInt(e.target.value))}
                className="h-2 cursor-pointer"
              />
              {errors.effort && (
                <p className="text-sm text-destructive">{errors.effort.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessValue">
                Business Value: {businessValue}
                <span className="ml-2 text-xs text-muted-foreground">
                  (1=Low, 10=High)
                </span>
              </Label>
              <Input
                id="businessValue"
                type="range"
                min="1"
                max="10"
                step="1"
                value={businessValue}
                onChange={(e) => setValue('businessValue', parseInt(e.target.value))}
                className="h-2 cursor-pointer"
              />
              {errors.businessValue && (
                <p className="text-sm text-destructive">
                  {errors.businessValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category (optional)</Label>
              <Select
                value={selectedCategoryId || ''}
                onValueChange={(value) =>
                  setValue('categoryId', value === '' ? undefined : value)
                }
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
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
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as IdeaStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : idea ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
