import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import ExcelJS from 'exceljs'
import {
  addIdeasSheet,
  addCategoriesSheet,
  addMetadataSheet,
  addFilterPresetsSheet,
} from '@/lib/export-utils'

export const exportRouter = createTRPCRouter({
  // Generate Excel file for a matrix
  exportMatrixToExcel: publicProcedure
    .input(
      z.object({
        matrixId: z.string(),
        includeFilterPresets: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch matrix with all related data
      const matrix = await ctx.prisma.impactMatrix.findUnique({
        where: { id: input.matrixId },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
          ideas: {
            include: {
              category: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          categories: {
            orderBy: {
              name: 'asc',
            },
          },
          filterPresets: input.includeFilterPresets
            ? {
                orderBy: {
                  name: 'asc',
                },
              }
            : false,
        },
      })

      if (!matrix) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matrix not found',
        })
      }

      // 2. Generate Excel workbook
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Impact Matrix'
      workbook.created = new Date()
      workbook.modified = new Date()

      // 3. Add sheets
      addIdeasSheet(workbook, matrix.ideas)
      addCategoriesSheet(workbook, matrix.categories)
      addMetadataSheet(workbook, matrix)

      if (input.includeFilterPresets && matrix.filterPresets && matrix.filterPresets.length > 0) {
        addFilterPresetsSheet(workbook, matrix.filterPresets)
      }

      // 4. Convert to base64 buffer
      const buffer = await workbook.xlsx.writeBuffer()
      const base64 = Buffer.from(buffer).toString('base64')

      // 5. Generate filename
      const sanitizedName = matrix.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const filename = `${sanitizedName}-${timestamp}.xlsx`

      return {
        base64,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    }),
})
