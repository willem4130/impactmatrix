'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Organization } from '@prisma/client'
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

const organizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization?: Organization | null
  onSubmit: (data: OrganizationFormData) => void
  isLoading?: boolean
}

export function OrganizationFormDialog({
  open,
  onOpenChange,
  organization,
  onSubmit,
  isLoading = false,
}: OrganizationFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organization
      ? { name: organization.name, description: organization.description || '' }
      : { name: '', description: '' },
  })

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        description: organization.description || '',
      })
    } else {
      reset({ name: '', description: '' })
    }
  }, [organization, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{organization ? 'Edit' : 'Create'} Organization</DialogTitle>
            <DialogDescription>
              {organization
                ? 'Update the organization details.'
                : 'Create a new organization to manage projects.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} placeholder="Acme Corporation" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Brief description of the organization"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : organization ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
