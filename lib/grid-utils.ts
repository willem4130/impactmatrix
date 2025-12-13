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

/**
 * Check if an idea has position drift (manually positioned away from grid-calculated position)
 * Returns true if the idea has a custom position that differs from the calculated grid position
 */
export function hasPositionDrift(
  positionX: number | null,
  positionY: number | null,
  effort: number,
  businessValue: number,
  tolerance: number = 10
): boolean {
  // If no custom position is set, there's no drift
  if (positionX === null || positionY === null) {
    return false
  }

  // Calculate the expected grid position
  const calculatedPosition = gridToPosition(effort, businessValue)

  // Check if the actual position differs from calculated position by more than tolerance
  const xDiff = Math.abs(positionX - calculatedPosition.x)
  const yDiff = Math.abs(positionY - calculatedPosition.y)

  return xDiff > tolerance || yDiff > tolerance
}

/**
 * Calculate the distance (in pixels) between current position and grid-calculated position
 */
export function getPositionDriftDistance(
  positionX: number | null,
  positionY: number | null,
  effort: number,
  businessValue: number
): number {
  if (positionX === null || positionY === null) {
    return 0
  }

  const calculatedPosition = gridToPosition(effort, businessValue)
  const xDiff = positionX - calculatedPosition.x
  const yDiff = positionY - calculatedPosition.y

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}

/**
 * Get the drift in terms of effort and business value differences
 * Returns how many grid units the position differs from the calculated position
 */
export function getPositionDriftDelta(
  positionX: number | null,
  positionY: number | null,
  effort: number,
  businessValue: number
): { effortDelta: number; valueDelta: number } {
  if (positionX === null || positionY === null) {
    return { effortDelta: 0, valueDelta: 0 }
  }

  // Calculate what the grid position would be based on current pixel position
  const currentGridPosition = positionToGrid(positionX, positionY)

  // Calculate the difference from the actual effort/businessValue scores
  const effortDelta = currentGridPosition.effort - effort
  const valueDelta = currentGridPosition.businessValue - businessValue

  return { effortDelta, valueDelta }
}

/**
 * Format the drift delta for display
 */
export function formatDriftDelta(effortDelta: number, valueDelta: number): string {
  const parts: string[] = []

  if (effortDelta !== 0) {
    const sign = effortDelta > 0 ? '+' : ''
    parts.push(`E${sign}${effortDelta}`)
  }

  if (valueDelta !== 0) {
    const sign = valueDelta > 0 ? '+' : ''
    parts.push(`V${sign}${valueDelta}`)
  }

  return parts.length > 0 ? parts.join(' ') : 'No drift'
}
