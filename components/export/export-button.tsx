'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

interface ExportButtonProps {
  matrixId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function ExportButton({
  matrixId,
  variant = 'outline',
  size = 'default',
}: ExportButtonProps) {
  const [includeFilterPresets, setIncludeFilterPresets] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const exportMutation = api.export.exportMatrixToExcel.useMutation({
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a')
      link.href = `data:${data.mimeType};base64,${data.base64}`
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Excel file downloaded')
      setIsOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export')
    },
  })

  const handleExport = () => {
    exportMutation.mutate({
      matrixId,
      includeFilterPresets,
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Export Options</h4>
            <p className="text-sm text-muted-foreground">
              Export this matrix to an Excel file
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-presets"
              checked={includeFilterPresets}
              onCheckedChange={(checked) =>
                setIncludeFilterPresets(checked === true)
              }
            />
            <Label htmlFor="include-presets" className="text-sm cursor-pointer">
              Include filter presets
            </Label>
          </div>

          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="w-full"
          >
            {exportMutation.isPending ? 'Exporting...' : 'Download Excel'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
