'use client'

import { Idea, Category } from '@prisma/client'
import { IdeaCard } from './idea-card'
import {
  GRID_SIZE,
  CELL_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  QUADRANTS,
  gridToPosition,
} from '@/lib/grid-utils'

type IdeaWithCategory = Idea & {
  category: Category | null
}

interface MatrixGridProps {
  ideas: IdeaWithCategory[]
}

export function MatrixGrid({ ideas }: MatrixGridProps) {
  return (
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
          <div className="text-center">
            <div className="text-sm font-semibold text-green-700">
              {QUADRANTS['quick-wins'].label}
            </div>
            <div className="text-xs text-muted-foreground">
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
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-700">
              {QUADRANTS['major-projects'].label}
            </div>
            <div className="text-xs text-muted-foreground">
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
          <div className="text-center">
            <div className="text-sm font-semibold text-yellow-700">
              {QUADRANTS['fill-ins'].label}
            </div>
            <div className="text-xs text-muted-foreground">
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
          <div className="text-center">
            <div className="text-sm font-semibold text-red-700">
              {QUADRANTS['thankless-tasks'].label}
            </div>
            <div className="text-xs text-muted-foreground">
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
                left: i * CELL_SIZE,
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
                top: i * CELL_SIZE,
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
  )
}
