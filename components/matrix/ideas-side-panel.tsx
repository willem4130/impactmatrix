'use client'

import { Idea, Category } from '@prisma/client'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface IdeasSidePanelProps {
  ideas: IdeaWithCategory[]
  matrixId: string
  onClose: () => void
}

export function IdeasSidePanel({ ideas, matrixId, onClose }: IdeasSidePanelProps) {
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
    <div className="fixed right-0 top-0 h-screen w-80 border-l bg-background shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
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
                  {idea.category && (
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0 ring-1 ring-white/20"
                      style={{ backgroundColor: idea.category.color }}
                      title={idea.category.name}
                    />
                  )}
                </div>

                {idea.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {idea.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      E:{idea.effort}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      V:{idea.businessValue}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
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
  )
}
