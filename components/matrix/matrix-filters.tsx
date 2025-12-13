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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, ChevronDown, X, Save, BookmarkPlus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUADRANTS } from '@/lib/grid-utils'
import {
  filterIdeas,
  countActiveFilters,
  getDefaultFilterState,
  type FilterState,
  type IdeaWithCategory,
} from '@/lib/filter-utils'
import { api } from '@/trpc/react'

interface MatrixFiltersProps {
  ideas: IdeaWithCategory[]
  categories: Category[]
  impactMatrixId: string
  onFilterChange: (filteredIdeas: IdeaWithCategory[]) => void
}

export function MatrixFilters({
  ideas,
  categories,
  impactMatrixId,
  onFilterChange,
}: MatrixFiltersProps) {
  const [expanded, setExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>(getDefaultFilterState())
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')

  // Query presets
  const { data: presets = [], refetch: refetchPresets } = api.filterPreset.list.useQuery({
    impactMatrixId,
  })

  // Mutations
  const createPreset = api.filterPreset.create.useMutation({
    onSuccess: () => {
      refetchPresets()
      setSaveDialogOpen(false)
      setPresetName('')
    },
  })

  const deletePreset = api.filterPreset.delete.useMutation({
    onSuccess: () => {
      refetchPresets()
    },
  })

  // Apply filters and notify parent
  useEffect(() => {
    const filtered = filterIdeas(ideas, filters)
    onFilterChange(filtered)
  }, [ideas, filters, onFilterChange])

  const activeCount = countActiveFilters(filters)

  const resetFilters = () => {
    setFilters(getDefaultFilterState())
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    createPreset.mutate({
      name: presetName,
      filters,
      impactMatrixId,
    })
  }

  const handleLoadPreset = (presetFilters: any) => {
    setFilters(presetFilters as FilterState)
  }

  const handleDeletePreset = (presetId: string) => {
    deletePreset.mutate({ id: presetId })
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

            {/* Presets section */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Saved Presets</div>
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activeCount === 0}
                    >
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save Preset
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Filter Preset</DialogTitle>
                      <DialogDescription>
                        Give your filter preset a name to save it for later use.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="preset-name">Preset Name</Label>
                        <Input
                          id="preset-name"
                          placeholder="e.g., High Priority In Progress"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSavePreset()
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSaveDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePreset}
                        disabled={!presetName.trim() || createPreset.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Preset chips */}
              {presets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset: { id: string; name: string; filters: any }) => (
                    <Badge
                      key={preset.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors group pr-1"
                    >
                      <span
                        onClick={() => handleLoadPreset(preset.filters)}
                        className="flex-1 pr-2"
                      >
                        {preset.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePreset(preset.id)
                        }}
                        className="ml-1 rounded-sm hover:bg-destructive hover:text-destructive-foreground p-0.5 opacity-70 hover:opacity-100 transition-opacity"
                        disabled={deletePreset.isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No saved presets yet. Apply some filters and save them as a preset.
                </p>
              )}
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
