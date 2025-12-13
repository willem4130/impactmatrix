// Grid configuration
export const GRID_SIZE = 10 // 10x10 grid
export const CELL_WIDTH = 120 // pixels
export const CELL_HEIGHT = 65 // pixels
export const GRID_WIDTH = GRID_SIZE * CELL_WIDTH
export const GRID_HEIGHT = GRID_SIZE * CELL_HEIGHT

// Quadrant definitions
export type Quadrant = 'quick-wins' | 'major-projects' | 'fill-ins' | 'thankless-tasks'

export interface QuadrantInfo {
  id: Quadrant
  label: string
  description: string
  color: string
  className: string
}

export const QUADRANTS: Record<Quadrant, QuadrantInfo> = {
  'quick-wins': {
    id: 'quick-wins',
    label: 'Quick Wins',
    description: 'Low effort, high value - prioritize these!',
    color: '#22c55e',
    className: 'bg-green-500/10 border-green-500/20',
  },
  'major-projects': {
    id: 'major-projects',
    label: 'Major Projects',
    description: 'High effort, high value - plan carefully',
    color: '#3b82f6',
    className: 'bg-blue-500/10 border-blue-500/20',
  },
  'fill-ins': {
    id: 'fill-ins',
    label: 'Fill-Ins',
    description: 'Low effort, low value - do when you have time',
    color: '#eab308',
    className: 'bg-yellow-500/10 border-yellow-500/20',
  },
  'thankless-tasks': {
    id: 'thankless-tasks',
    label: 'Thankless Tasks',
    description: 'High effort, low value - avoid or eliminate',
    color: '#ef4444',
    className: 'bg-red-500/10 border-red-500/20',
  },
}

/**
 * Convert effort and business value (1-10) to pixel position
 * X-axis: effort (1 = left, 10 = right)
 * Y-axis: business value (1 = bottom, 10 = top)
 */
export function gridToPosition(effort: number, businessValue: number): { x: number; y: number } {
  const x = (effort - 1) * CELL_WIDTH + CELL_WIDTH / 2
  const y = (GRID_SIZE - businessValue) * CELL_HEIGHT + CELL_HEIGHT / 2
  return { x, y }
}

/**
 * Convert pixel position to effort and business value (1-10)
 */
export function positionToGrid(x: number, y: number): { effort: number; businessValue: number } {
  const effort = Math.max(1, Math.min(10, Math.round(x / CELL_WIDTH) + 1))
  const businessValue = Math.max(1, Math.min(10, GRID_SIZE - Math.round(y / CELL_HEIGHT)))
  return { effort, businessValue }
}

/**
 * Determine which quadrant an idea belongs to based on its effort and value
 */
export function getQuadrant(effort: number, businessValue: number): Quadrant {
  const isHighEffort = effort > 5
  const isHighValue = businessValue > 5

  if (isHighValue && !isHighEffort) return 'quick-wins'
  if (isHighValue && isHighEffort) return 'major-projects'
  if (!isHighValue && !isHighEffort) return 'fill-ins'
  return 'thankless-tasks'
}
