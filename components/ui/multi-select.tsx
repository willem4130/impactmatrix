'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface MultiSelectOption {
  label: string
  value: string
}

interface MultiSelectProps {
  label: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    onChange(options.map((option) => option.value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleRemove = (value: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <div className="flex gap-1 flex-wrap flex-1 min-w-0">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">
                  {placeholder || `Select ${label.toLowerCase()}...`}
                </span>
              ) : (
                selectedLabels.map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="mr-1"
                    onClick={(e) => {
                      const option = options.find((opt) => opt.label === label)
                      if (option) {
                        handleRemove(option.value, e)
                      }
                    }}
                  >
                    {label}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 space-y-1">
            {/* Select All / Clear All */}
            <div className="flex gap-2 pb-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-1"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-1"
                onClick={handleClearAll}
                disabled={selected.length === 0}
              >
                Clear All
              </Button>
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-y-auto">
              {options.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent',
                      selected.includes(option.value) && 'bg-accent'
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Checkbox
                      checked={selected.includes(option.value)}
                      onCheckedChange={() => handleSelect(option.value)}
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    {selected.includes(option.value) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
