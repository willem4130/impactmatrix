'use client'

import { Idea, Category, IdeaStatus } from '@prisma/client'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useState } from 'react'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface IdeasTableProps {
  ideas: IdeaWithCategory[]
  onEdit: (idea: Idea) => void
  onDelete: (id: string) => void
}

const STATUS_LABELS: Record<IdeaStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
}

const STATUS_COLORS: Record<IdeaStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
}

const getQuadrant = (effort: number, businessValue: number): string => {
  if (businessValue > 5 && effort <= 5) return 'Quick Wins'
  if (businessValue > 5 && effort > 5) return 'Major Projects'
  if (businessValue <= 5 && effort <= 5) return 'Fill-Ins'
  return 'Thankless Tasks'
}

const QUADRANT_COLORS: Record<string, string> = {
  'Quick Wins': 'bg-green-100 text-green-800',
  'Major Projects': 'bg-blue-100 text-blue-800',
  'Fill-Ins': 'bg-yellow-100 text-yellow-800',
  'Thankless Tasks': 'bg-red-100 text-red-800',
}

export function IdeasTable({ ideas, onEdit, onDelete }: IdeasTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Effort</TableHead>
              <TableHead className="text-center">Value</TableHead>
              <TableHead>Quadrant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ideas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No ideas found.
                </TableCell>
              </TableRow>
            ) : (
              ideas.map((idea) => {
                const quadrant = getQuadrant(idea.effort, idea.businessValue)
                return (
                  <TableRow key={idea.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        <div className="truncate">{idea.title}</div>
                        {idea.description && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {idea.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {idea.category ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: idea.category.color }}
                          />
                          <span className="text-sm">{idea.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{idea.effort}/10</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{idea.businessValue}/10</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={QUADRANT_COLORS[quadrant]}>{quadrant}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[idea.status]}>
                        {STATUS_LABELS[idea.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(idea)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(idea.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this idea. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
