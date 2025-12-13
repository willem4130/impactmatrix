import { Idea, Category, IdeaStatus } from '@prisma/client'
import { positionToGrid, getQuadrant, hasPositionDrift, Quadrant } from './grid-utils'

export type IdeaWithCategory = Idea & {
  category: Category | null
}

export interface FilterState {
  categoryIds: string[]              // Empty = all categories
  statuses: IdeaStatus[]             // Empty = all statuses
  quadrants: Quadrant[]              // Empty = all quadrants
  originalEffort: [number, number]   // [1, 10]
  originalValue: [number, number]    // [1, 10]
  originalWeight: [number, number]   // [1, 10]
  positionedEffort: [number, number] // [1, 10]
  positionedValue: [number, number]  // [1, 10]
  onlyWithDrift: boolean             // Show only custom-positioned ideas
}

/**
 * Get the effective effort value for filtering
 * If idea has custom position, use positioned effort
 * Otherwise use original effort
 */
export function getPositionedEffort(idea: Idea): number {
  if (idea.positionX !== null && idea.positionY !== null) {
    const { effort } = positionToGrid(idea.positionX, idea.positionY)
    return effort
  }
  return idea.effort
}

/**
 * Get the effective business value for filtering
 * If idea has custom position, use positioned value
 * Otherwise use original value
 */
export function getPositionedValue(idea: Idea): number {
  if (idea.positionX !== null && idea.positionY !== null) {
    const { businessValue } = positionToGrid(idea.positionX, idea.positionY)
    return businessValue
  }
  return idea.businessValue
}

/**
 * Filter ideas based on the provided filter state
 * Returns ideas that match ALL filter criteria (AND logic between filter types)
 * Within multi-select filters (categories, statuses, quadrants), uses OR logic
 */
export function filterIdeas(
  ideas: IdeaWithCategory[],
  filters: FilterState
): IdeaWithCategory[] {
  return ideas.filter(idea => {
    // Category filter (OR logic - show if matches ANY selected category)
    if (filters.categoryIds.length > 0) {
      if (!idea.categoryId || !filters.categoryIds.includes(idea.categoryId)) {
        return false
      }
    }

    // Status filter (OR logic - show if matches ANY selected status)
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(idea.status)) {
        return false
      }
    }

    // Range filters (AND logic - must be within all ranges)
    const weight = idea.weight ?? 5

    // Original effort filter
    if (idea.effort < filters.originalEffort[0] ||
        idea.effort > filters.originalEffort[1]) {
      return false
    }

    // Original business value filter
    if (idea.businessValue < filters.originalValue[0] ||
        idea.businessValue > filters.originalValue[1]) {
      return false
    }

    // Original weight filter
    if (weight < filters.originalWeight[0] ||
        weight > filters.originalWeight[1]) {
      return false
    }

    // Positioned filters
    const posEffort = getPositionedEffort(idea)
    const posValue = getPositionedValue(idea)

    // Positioned effort filter
    if (posEffort < filters.positionedEffort[0] ||
        posEffort > filters.positionedEffort[1]) {
      return false
    }

    // Positioned business value filter
    if (posValue < filters.positionedValue[0] ||
        posValue > filters.positionedValue[1]) {
      return false
    }

    // Quadrant filter (OR logic - show if in ANY selected quadrant)
    if (filters.quadrants.length > 0) {
      const quadrant = getQuadrant(posEffort, posValue)
      if (!filters.quadrants.includes(quadrant)) {
        return false
      }
    }

    // Position drift filter
    if (filters.onlyWithDrift) {
      if (!hasPositionDrift(idea.positionX, idea.positionY,
                            idea.effort, idea.businessValue)) {
        return false
      }
    }

    return true
  })
}

/**
 * Count the number of active filters
 * Used to show the active filter count badge
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0

  if (filters.categoryIds.length > 0) count++
  if (filters.statuses.length > 0) count++
  if (filters.quadrants.length > 0) count++
  if (filters.originalEffort[0] > 1 || filters.originalEffort[1] < 10) count++
  if (filters.originalValue[0] > 1 || filters.originalValue[1] < 10) count++
  if (filters.originalWeight[0] > 1 || filters.originalWeight[1] < 10) count++
  if (filters.positionedEffort[0] > 1 || filters.positionedEffort[1] < 10) count++
  if (filters.positionedValue[0] > 1 || filters.positionedValue[1] < 10) count++
  if (filters.onlyWithDrift) count++

  return count
}

/**
 * Get the default filter state
 */
export function getDefaultFilterState(): FilterState {
  return {
    categoryIds: [],
    statuses: [],
    quadrants: [],
    originalEffort: [1, 10],
    originalValue: [1, 10],
    originalWeight: [1, 10],
    positionedEffort: [1, 10],
    positionedValue: [1, 10],
    onlyWithDrift: false,
  }
}
