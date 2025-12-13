'use client'

import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  className?: string
}

export function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  className,
}: RangeSliderProps) {
  const handleValueChange = (newValue: number[]) => {
    if (newValue.length === 2) {
      onChange([newValue[0]!, newValue[1]!])
    }
  }

  const isDefault = value[0] === min && value[1] === max

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className={cn(
          'text-xs',
          isDefault ? 'text-muted-foreground' : 'text-foreground font-medium'
        )}>
          {value[0]} - {value[1]}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleValueChange}
        className="w-full"
      />
    </div>
  )
}
