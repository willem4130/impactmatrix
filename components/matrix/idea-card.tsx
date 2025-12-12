'use client'

import { Idea, Category } from '@prisma/client'
import { useDraggable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface IdeaCardProps {
  idea: IdeaWithCategory
  style?: React.CSSProperties
  isDragOverlay?: boolean
}

export function IdeaCard({ idea, style, isDragOverlay = false }: IdeaCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: idea.id,
    disabled: isDragOverlay,
  })

  const draggableStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="absolute flex flex-col gap-1 rounded-lg border bg-card p-2 shadow-md transition-all hover:shadow-lg cursor-grab active:cursor-grabbing"
      style={{
        ...style,
        ...draggableStyle,
        width: '140px',
        transform: isDragging
          ? 'translate(-50%, -50%) scale(1.05)'
          : style?.transform || 'translate(-50%, -50%)',
        opacity: isDragging ? 0.5 : (style?.opacity ?? 1),
        zIndex: isDragging ? 999 : 'auto',
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
