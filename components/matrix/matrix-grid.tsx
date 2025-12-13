'use client'

import { useState } from 'react'
import { Idea, Category } from '@prisma/client'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
} from '@dnd-kit/core'
import { IdeaCard } from './idea-card'
import {
  GRID_SIZE,
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_WIDTH,
  GRID_HEIGHT,
  QUADRANTS,
  gridToPosition,
  positionToGrid,
} from '@/lib/grid-utils'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface MatrixGridProps {
  ideas: IdeaWithCategory[]
  onIdeaMove?: (ideaId: string, newEffort: number, newBusinessValue: number) => void
  onIdeaUpdate?: (ideaId: string, newEffort: number, newBusinessValue: number) => void
}

export function MatrixGrid({ ideas, onIdeaMove, onIdeaUpdate }: MatrixGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for smoother dragging
        delay: 0,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const idea = ideas.find((i) => i.id === active.id)

    if (idea && delta.x !== 0 && delta.y !== 0) {
      const currentPosition = gridToPosition(idea.effort, idea.businessValue)
      const newPosition = {
        x: currentPosition.x + delta.x,
        y: currentPosition.y + delta.y,
      }

      // Convert new pixel position back to grid coordinates
      const { effort, businessValue } = positionToGrid(newPosition.x, newPosition.y)

      // Only update if the position changed
      if (effort !== idea.effort || businessValue !== idea.businessValue) {
        onIdeaMove?.(idea.id, effort, businessValue)
      }
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeIdea = activeId ? ideas.find((i) => i.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex items-center gap-8">
      {/* Y-axis label */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <span>High Value</span>
          <span>↑</span>
          <div
            className="text-center writing-mode-vertical"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            Business Value
          </div>
          <span>↓</span>
          <span>Low Value</span>
        </div>
      </div>

      {/* Grid and X-axis */}
      <div className="flex flex-col items-center gap-4">
        {/* Grid container */}
        <div className="relative" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
        {/* Quadrant backgrounds */}
        {/* Quick Wins - top left */}
        <div
          className={`absolute border ${QUADRANTS['quick-wins'].className}`}
          style={{
            left: 0,
            top: 0,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
          }}
        />
        {/* Major Projects - top right */}
        <div
          className={`absolute border ${QUADRANTS['major-projects'].className}`}
          style={{
            left: GRID_WIDTH / 2,
            top: 0,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
          }}
        />
        {/* Fill-Ins - bottom left */}
        <div
          className={`absolute border ${QUADRANTS['fill-ins'].className}`}
          style={{
            left: 0,
            top: GRID_HEIGHT / 2,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
          }}
        />
        {/* Thankless Tasks - bottom right */}
        <div
          className={`absolute border ${QUADRANTS['thankless-tasks'].className}`}
          style={{
            left: GRID_WIDTH / 2,
            top: GRID_HEIGHT / 2,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
          }}
        />

        {/* Quadrant labels */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: 0,
            top: 0,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
            pointerEvents: 'none',
          }}
        >
          <div className="text-center px-4">
            <div className="text-base font-bold text-green-700">
              {QUADRANTS['quick-wins'].label}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {QUADRANTS['quick-wins'].description}
            </div>
          </div>
        </div>
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: GRID_WIDTH / 2,
            top: 0,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
            pointerEvents: 'none',
          }}
        >
          <div className="text-center px-4">
            <div className="text-base font-bold text-blue-700">
              {QUADRANTS['major-projects'].label}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {QUADRANTS['major-projects'].description}
            </div>
          </div>
        </div>
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: 0,
            top: GRID_HEIGHT / 2,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
            pointerEvents: 'none',
          }}
        >
          <div className="text-center px-4">
            <div className="text-base font-bold text-yellow-700">
              {QUADRANTS['fill-ins'].label}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {QUADRANTS['fill-ins'].description}
            </div>
          </div>
        </div>
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: GRID_WIDTH / 2,
            top: GRID_HEIGHT / 2,
            width: GRID_WIDTH / 2,
            height: GRID_HEIGHT / 2,
            pointerEvents: 'none',
          }}
        >
          <div className="text-center px-4">
            <div className="text-base font-bold text-red-700">
              {QUADRANTS['thankless-tasks'].label}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {QUADRANTS['thankless-tasks'].description}
            </div>
          </div>
        </div>

        {/* Grid lines */}
        {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
          <div key={`v-${i}`}>
            {/* Vertical lines */}
            <div
              className="absolute bg-border"
              style={{
                left: i * CELL_WIDTH,
                top: 0,
                width: i === 0 || i === GRID_SIZE || i === GRID_SIZE / 2 ? 2 : 1,
                height: GRID_HEIGHT,
                opacity: i === 0 || i === GRID_SIZE || i === GRID_SIZE / 2 ? 0.3 : 0.1,
              }}
            />
            {/* Horizontal lines */}
            <div
              className="absolute bg-border"
              style={{
                left: 0,
                top: i * CELL_HEIGHT,
                width: GRID_WIDTH,
                height: i === 0 || i === GRID_SIZE || i === GRID_SIZE / 2 ? 2 : 1,
                opacity: i === 0 || i === GRID_SIZE || i === GRID_SIZE / 2 ? 0.3 : 0.1,
              }}
            />
          </div>
        ))}

        {/* Ideas */}
        {ideas.map((idea) => {
          const position = gridToPosition(idea.effort, idea.businessValue)
          return (
            <IdeaCard
              key={idea.id}
              idea={idea}
              style={{
                left: position.x,
                top: position.y,
              }}
              onUpdate={onIdeaUpdate}
            />
          )
        })}
      </div>

        {/* X-axis labels */}
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>←</span>
            <span>Low Effort</span>
          </div>
          <div className="flex items-center gap-2">
            <span>High Effort</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>

      <DragOverlay>
        {activeIdea ? (
          <IdeaCard
            idea={activeIdea}
            isDragOverlay
            style={{
              cursor: 'grabbing',
              opacity: 0.8,
            }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
