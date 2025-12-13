import ExcelJS from 'exceljs'
import type { Idea, Category, ImpactMatrix, Project, Organization, FilterPreset } from '@prisma/client'
import { getQuadrant, hasPositionDrift, positionToGrid, QUADRANTS } from './grid-utils'

// Extended types for nested data
type IdeaWithCategory = Idea & { category: Category | null }
type MatrixWithData = ImpactMatrix & {
  project: Project & {
    organization: Organization
  }
  ideas: IdeaWithCategory[]
  categories: Category[]
}

/**
 * Add Ideas sheet to workbook with all idea data
 */
export function addIdeasSheet(
  workbook: ExcelJS.Workbook,
  ideas: IdeaWithCategory[]
): void {
  const sheet = workbook.addWorksheet('Ideas', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }], // Freeze header row
  })

  // Define columns
  sheet.columns = [
    { header: 'ID', key: 'id', width: 25 },
    { header: 'Title *', key: 'title', width: 30 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Effort *', key: 'effort', width: 10 },
    { header: 'Business Value *', key: 'businessValue', width: 15 },
    { header: 'Weight *', key: 'weight', width: 10 },
    { header: 'Status *', key: 'status', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Position X', key: 'positionX', width: 12 },
    { header: 'Position Y', key: 'positionY', width: 12 },
    { header: 'Quadrant', key: 'quadrant', width: 20 },
    { header: 'Has Drift', key: 'hasDrift', width: 10 },
  ]

  // Style header row
  const headerRow = sheet.getRow(1)
  styleHeaderRow(headerRow, '3b82f6')

  // Add data rows
  ideas.forEach((idea) => {
    const posEffort =
      idea.positionX !== null && idea.positionY !== null
        ? positionToGrid(idea.positionX, idea.positionY).effort
        : idea.effort
    const posValue =
      idea.positionX !== null && idea.positionY !== null
        ? positionToGrid(idea.positionX, idea.positionY).businessValue
        : idea.businessValue

    sheet.addRow({
      id: idea.id,
      title: idea.title,
      description: idea.description || '',
      effort: idea.effort,
      businessValue: idea.businessValue,
      weight: idea.weight,
      status: idea.status,
      category: idea.category?.name || '',
      positionX: idea.positionX,
      positionY: idea.positionY,
      quadrant: QUADRANTS[getQuadrant(posEffort, posValue)].label,
      hasDrift: hasPositionDrift(idea.positionX, idea.positionY, idea.effort, idea.businessValue),
    })
  })

  // Style calculated columns (gray background)
  const calcColumns = ['K', 'L'] // Quadrant, Has Drift
  calcColumns.forEach((col) => {
    const column = sheet.getColumn(col)
    column.eachCell({ includeEmpty: false }, (cell, rowNum) => {
      if (rowNum > 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E7EB' }, // gray-200
        }
      }
    })
  })

  // Add data validation for Status column
  for (let row = 2; row <= ideas.length + 1; row++) {
    const statusCell = sheet.getCell(`G${row}`)
    statusCell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"DRAFT,IN_PROGRESS,COMPLETED,ARCHIVED"'],
    }
  }
}

/**
 * Add Categories sheet to workbook
 */
export function addCategoriesSheet(
  workbook: ExcelJS.Workbook,
  categories: Category[]
): void {
  const sheet = workbook.addWorksheet('Categories', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  // Define columns
  sheet.columns = [
    { header: 'ID', key: 'id', width: 25 },
    { header: 'Name *', key: 'name', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Color *', key: 'color', width: 12 },
  ]

  // Style header row
  const headerRow = sheet.getRow(1)
  styleHeaderRow(headerRow, '22c55e')

  // Add data rows
  categories.forEach((category) => {
    const row = sheet.addRow({
      id: category.id,
      name: category.name,
      description: category.description || '',
      color: category.color,
    })

    // Color the color cell background to match the category color
    const colorCell = row.getCell(4)
    try {
      // Remove # and parse hex color
      const colorHex = category.color.replace('#', '')
      colorCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${colorHex}` },
      }
      // Make text white for better contrast
      colorCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    } catch (error) {
      // If color parsing fails, just continue
      console.error('Failed to parse color:', category.color, error)
    }
  })
}

/**
 * Add Metadata sheet with key-value pairs
 */
export function addMetadataSheet(
  workbook: ExcelJS.Workbook,
  matrix: MatrixWithData
): void {
  const sheet = workbook.addWorksheet('Metadata', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  // Define columns
  sheet.columns = [
    { header: 'Key', key: 'key', width: 25 },
    { header: 'Value', key: 'value', width: 50 },
  ]

  // Style header row
  const headerRow = sheet.getRow(1)
  styleHeaderRow(headerRow, '3b82f6')

  // Add metadata rows
  const metadata = [
    { key: 'Matrix ID', value: matrix.id },
    { key: 'Matrix Name', value: matrix.name },
    { key: 'Matrix Description', value: matrix.description || '—' },
    { key: 'Project', value: matrix.project.name },
    { key: 'Organization', value: matrix.project.organization.name },
    { key: 'Export Date', value: new Date().toISOString() },
    { key: 'Total Ideas', value: matrix.ideas.length.toString() },
    { key: 'Total Categories', value: matrix.categories.length.toString() },
    { key: 'Export Version', value: '1.0' },
  ]

  metadata.forEach((item) => {
    const row = sheet.addRow(item)
    // Bold the key column
    row.getCell(1).font = { bold: true }
  })
}

/**
 * Add Filter Presets sheet (optional)
 */
export function addFilterPresetsSheet(
  workbook: ExcelJS.Workbook,
  presets: FilterPreset[]
): void {
  const sheet = workbook.addWorksheet('Filter Presets', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  })

  // Define columns
  sheet.columns = [
    { header: 'ID', key: 'id', width: 25 },
    { header: 'Name *', key: 'name', width: 30 },
    { header: 'Filters JSON', key: 'filters', width: 80 },
  ]

  // Style header row
  const headerRow = sheet.getRow(1)
  styleHeaderRow(headerRow, 'eab308')

  // Add data rows
  presets.forEach((preset) => {
    const row = sheet.addRow({
      id: preset.id,
      name: preset.name,
      filters: JSON.stringify(preset.filters),
    })

    // Monospace font for JSON column
    const jsonCell = row.getCell(3)
    jsonCell.font = { name: 'Courier New', size: 10 }
  })
}

/**
 * Apply consistent header styling
 */
export function styleHeaderRow(row: ExcelJS.Row, bgColor: string): void {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${bgColor}` },
    }
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }, // white text
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }
  })
  row.height = 20
}
