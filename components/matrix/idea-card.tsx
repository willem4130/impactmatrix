'use client'

import { useState, useRef, useEffect } from 'react'
import { Idea, Category } from '@prisma/client'
import { useDraggable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface IdeaCardProps {
  idea: IdeaWithCategory
  style?: React.CSSProperties
  isDragOverlay?: boolean
  onUpdate?: (id: string, effort: number, businessValue: number, weight: number) => void
  onResetPosition?: (id: string) => void
}

export function IdeaCard({ idea, style, isDragOverlay = false, onUpdate, onResetPosition }: IdeaCardProps) {
  const [editingField, setEditingField] = useState<'effort' | 'businessValue' | 'weight' | null>(null)
  const [effortValue, setEffortValue] = useState(idea.effort.toString())
  const [businessValueValue, setBusinessValueValue] = useState(idea.businessValue.toString())
  const [weightValue, setWeightValue] = useState(idea.weight.toString())
  const effortInputRef = useRef<HTMLInputElement>(null)
  const businessValueInputRef = useRef<HTMLInputElement>(null)
  const weightInputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: idea.id,
    disabled: isDragOverlay || editingField !== null,
  })

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingField === 'effort') {
      effortInputRef.current?.focus()
      effortInputRef.current?.select()
    } else if (editingField === 'businessValue') {
      businessValueInputRef.current?.focus()
      businessValueInputRef.current?.select()
    } else if (editingField === 'weight') {
      weightInputRef.current?.focus()
      weightInputRef.current?.select()
    }
  }, [editingField])

  // Reset values when idea changes
  useEffect(() => {
    setEffortValue(idea.effort.toString())
    setBusinessValueValue(idea.businessValue.toString())
    setWeightValue(idea.weight.toString())
  }, [idea.effort, idea.businessValue, idea.weight])

  const handleSaveEffort = () => {
    const newEffort = parseInt(effortValue)
    if (!isNaN(newEffort) && newEffort >= 1 && newEffort <= 10 && newEffort !== idea.effort) {
      onUpdate?.(idea.id, newEffort, idea.businessValue, idea.weight)
    } else {
      setEffortValue(idea.effort.toString())
    }
    setEditingField(null)
  }

  const handleSaveBusinessValue = () => {
    const newBusinessValue = parseInt(businessValueValue)
    if (!isNaN(newBusinessValue) && newBusinessValue >= 1 && newBusinessValue <= 10 && newBusinessValue !== idea.businessValue) {
      onUpdate?.(idea.id, idea.effort, newBusinessValue, idea.weight)
    } else {
      setBusinessValueValue(idea.businessValue.toString())
    }
    setEditingField(null)
  }

  const handleSaveWeight = () => {
    const newWeight = parseInt(weightValue)
    if (!isNaN(newWeight) && newWeight >= 1 && newWeight <= 10 && newWeight !== idea.weight) {
      onUpdate?.(idea.id, idea.effort, idea.businessValue, newWeight)
    } else {
      setWeightValue(idea.weight.toString())
    }
    setEditingField(null)
  }

  // Combine base transform with drag transform
  const baseTransform = 'translate(-50%, -50%)'
  const scaleTransform = isDragging ? ' scale(1.05)' : ''
  const dragTransform = transform
    ? ` translate3d(${transform.x}px, ${transform.y}px, 0)`
    : ''
  const combinedTransform = baseTransform + scaleTransform + dragTransform

  return (
    <div
      ref={setNodeRef}
      {...(editingField ? {} : attributes)}
      {...(editingField ? {} : listeners)}
      className="absolute flex flex-col gap-1.5 rounded-lg border-2 bg-card p-3 shadow-lg hover:shadow-xl transition-all duration-150 cursor-grab active:cursor-grabbing"
      style={{
        ...style,
        width: '170px',
        transform: combinedTransform,
        opacity: isDragging ? 0.5 : (style?.opacity ?? 1),
        zIndex: isDragging ? 999 : editingField ? 50 : 'auto',
        cursor: editingField ? 'default' : 'grab',
      }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <h3 className="text-sm font-semibold line-clamp-2 flex-1 leading-tight">{idea.title}</h3>
        {idea.category && (
          <div
            className="h-3.5 w-3.5 rounded-full flex-shrink-0 ring-1 ring-white/20"
            style={{ backgroundColor: idea.category.color }}
            title={idea.category.name}
          />
        )}
      </div>
      {idea.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{idea.description}</p>
      )}
      <div className="flex items-center justify-between gap-1 mt-1">
        <div className="flex gap-1 flex-wrap">
          {editingField === 'effort' ? (
            <Input
              ref={effortInputRef}
              type="number"
              min="1"
              max="10"
              value={effortValue}
              onChange={(e) => setEffortValue(e.target.value)}
              onBlur={handleSaveEffort}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEffort()
                } else if (e.key === 'Escape') {
                  setEffortValue(idea.effort.toString())
                  setEditingField(null)
                }
              }}
              className="h-6 w-14 text-xs px-1.5 py-0.5"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-accent hover:scale-105 transition-transform"
              onClick={(e) => {
                e.stopPropagation()
                setEditingField('effort')
              }}
              title="Click to edit effort (1-10)"
            >
              E:{idea.effort}
            </Badge>
          )}
          {editingField === 'businessValue' ? (
            <Input
              ref={businessValueInputRef}
              type="number"
              min="1"
              max="10"
              value={businessValueValue}
              onChange={(e) => setBusinessValueValue(e.target.value)}
              onBlur={handleSaveBusinessValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveBusinessValue()
                } else if (e.key === 'Escape') {
                  setBusinessValueValue(idea.businessValue.toString())
                  setEditingField(null)
                }
              }}
              className="h-6 w-14 text-xs px-1.5 py-0.5"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-accent hover:scale-105 transition-transform"
              onClick={(e) => {
                e.stopPropagation()
                setEditingField('businessValue')
              }}
              title="Click to edit business value (1-10)"
            >
              V:{idea.businessValue}
            </Badge>
          )}
          {editingField === 'weight' ? (
            <Input
              ref={weightInputRef}
              type="number"
              min="1"
              max="10"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              onBlur={handleSaveWeight}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveWeight()
                } else if (e.key === 'Escape') {
                  setWeightValue(idea.weight.toString())
                  setEditingField(null)
                }
              }}
              className="h-6 w-14 text-xs px-1.5 py-0.5"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-accent hover:scale-105 transition-transform"
              onClick={(e) => {
                e.stopPropagation()
                setEditingField('weight')
              }}
              title="Click to edit weight/importance (1-10)"
            >
              W:{idea.weight}
            </Badge>
          )}
        </div>
        {onResetPosition && (idea.positionX !== null || idea.positionY !== null) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onResetPosition(idea.id)
            }}
            title="Reset to grid position"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
