'use client'

import { Organization } from '@prisma/client'
import { Building2, Pencil, Trash2, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import Link from 'next/link'

type OrganizationWithCount = Organization & {
  _count: { projects: number }
}

interface OrganizationCardProps {
  organization: OrganizationWithCount
  onEdit: (organization: Organization) => void
  onDelete: (id: string) => void
}

export function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{organization.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <FolderKanban className="h-3 w-3" />
              {organization._count.projects} {organization._count.projects === 1 ? 'project' : 'projects'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(organization)}>
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
                <AlertDialogTitle>Delete organization?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{organization.name}" and all its projects, matrices, ideas, and categories.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(organization.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {organization.description && (
        <p className="text-sm text-muted-foreground mb-4">{organization.description}</p>
      )}

      <Link href={`/organizations/${organization.id}`}>
        <Button variant="outline" className="w-full">
          View Projects
        </Button>
      </Link>
    </div>
  )
}
