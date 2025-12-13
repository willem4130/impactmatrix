'use client'

import { useState } from 'react'
import { Organization } from '@prisma/client'
import { Plus } from 'lucide-react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { OrganizationCard } from '@/components/organizations/organization-card'
import { OrganizationFormDialog } from '@/components/organizations/organization-form-dialog'
import { toast } from 'sonner'

export default function OrganizationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)

  const utils = api.useUtils()

  const { data: organizations, isLoading, error } = api.organization.list.useQuery()

  const createMutation = api.organization.create.useMutation({
    onSuccess: () => {
      utils.organization.list.invalidate()
      setIsDialogOpen(false)
      toast.success('Organization created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create organization')
    },
  })

  const updateMutation = api.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.list.invalidate()
      setIsDialogOpen(false)
      setEditingOrganization(null)
      toast.success('Organization updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update organization')
    },
  })

  const deleteMutation = api.organization.delete.useMutation({
    onSuccess: () => {
      utils.organization.list.invalidate()
      toast.success('Organization deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete organization')
    },
  })

  const handleCreateNew = () => {
    setEditingOrganization(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (organization: Organization) => {
    setEditingOrganization(organization)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }

  const handleSubmit = (data: { name: string; description?: string }) => {
    if (editingOrganization) {
      updateMutation.mutate({
        id: editingOrganization.id,
        ...data,
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingOrganization(null)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Error loading organizations: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organizations and their projects
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      ) : organizations && organizations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">No organizations yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first organization to get started
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first organization
          </Button>
        </div>
      )}

      <OrganizationFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        organization={editingOrganization}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
