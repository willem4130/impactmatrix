'use client'

import { useState, useMemo, useEffect } from 'react'
import { Category, IdeaStatus } from '@prisma/client'
import { MultiSelect } from '@/components/ui/multi-select'
import { RangeSlider } from '@/components/ui/range-slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Filter, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUADRANTS } from '@/lib/grid-utils'
import {
  filterIdeas,
  countActiveFilters,
  getDefaultFilterState,
  type FilterState,
  type IdeaWithCategory,
} from '@/lib/filter-utils'

interface MatrixFiltersProps {
  ideas: IdeaWithCategory[]
  categories: Category[]
  onFilterChange: (filteredIdeas: IdeaWithCategory[]) => void
}

export function MatrixFilters({
  ideas,
  categories,
  onFilterChange,
}: MatrixFiltersProps) {
  const [expanded, setExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>(getDefaultFilterState())

  // Apply filters and notify parent
  useEffect(() => {
    const filtered = filterIdeas(ideas, filters)
    onFilterChange(filtered)
  }, [ideas, filters, onFilterChange])

  const activeCount = countActiveFilters(filters)

  const resetFilters = () => {
    setFilters(getDefaultFilterState())
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="mb-6 rounded-lg border bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {activeCount > 0 && (
                <Badge variant="secondary">{activeCount} active</Badge>
              )}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                expanded && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t pt-4">
            {/* Multi-select filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MultiSelect
                label="Categories"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                selected={filters.categoryIds}
                onChange={(ids) =>
                  setFilters((prev) => ({ ...prev, categoryIds: ids }))
                }
              />
              <MultiSelect
                label="Status"
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
                selected={filters.statuses}
                onChange={(statuses) =>
                  setFilters((prev) => ({
                    ...prev,
                    statuses: statuses as IdeaStatus[],
                  }))
                }
              />
              <MultiSelect
                label="Quadrant"
                options={Object.values(QUADRANTS).map((q) => ({
                  value: q.id,
                  label: q.label,
                }))}
                selected={filters.quadrants}
                onChange={(quadrants) =>
                  setFilters((prev) => ({ ...prev, quadrants: quadrants as any }))
                }
              />
            </div>

            {/* Drift toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="drift"
                checked={filters.onlyWithDrift}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, onlyWithDrift: !!checked }))
                }
              />
              <label
                htmlFor="drift"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only custom-positioned ideas
              </label>
            </div>

            {/* Range sliders */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-semibold">Original Scores</div>
                <RangeSlider
                  label="Effort"
                  min={1}
                  max={10}
                  value={filters.originalEffort}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, originalEffort: value }))
                  }
                />
                <RangeSlider
                  label="Business Value"
                  min={1}
                  max={10}
                  value={filters.originalValue}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, originalValue: value }))
                  }
                />
                <RangeSlider
                  label="Weight"
                  min={1}
                  max={10}
                  value={filters.originalWeight}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, originalWeight: value }))
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold">Positioned Scores</div>
                <p className="text-xs text-muted-foreground">
                  Filter by where ideas are positioned on the grid
                </p>
                <RangeSlider
                  label="Effort"
                  min={1}
                  max={10}
                  value={filters.positionedEffort}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, positionedEffort: value }))
                  }
                />
                <RangeSlider
                  label="Business Value"
                  min={1}
                  max={10}
                  value={filters.positionedValue}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, positionedValue: value }))
                  }
                />
              </div>
            </div>

            {/* Clear all button */}
            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={activeCount === 0}
              >
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
