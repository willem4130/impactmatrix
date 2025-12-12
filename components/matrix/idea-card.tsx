'use client'

import { Idea, Category } from '@prisma/client'
import { Badge } from '@/components/ui/badge'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface IdeaCardProps {
  idea: IdeaWithCategory
  style?: React.CSSProperties
}

export function IdeaCard({ idea, style }: IdeaCardProps) {
  return (
    <div
      className="absolute flex flex-col gap-1 rounded-lg border bg-card p-2 shadow-md transition-all hover:shadow-lg cursor-pointer"
      style={{
        ...style,
        width: '140px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <h3 className="text-xs font-semibold line-clamp-2 flex-1">{idea.title}</h3>
        {idea.category && (
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: idea.category.color }}
            title={idea.category.name}
          />
        )}
      </div>
      {idea.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>
      )}
      <div className="flex items-center justify-between gap-1 mt-1">
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs px-1 py-0">
            E:{idea.effort}
          </Badge>
          <Badge variant="outline" className="text-xs px-1 py-0">
            V:{idea.businessValue}
          </Badge>
        </div>
      </div>
    </div>
  )
}
