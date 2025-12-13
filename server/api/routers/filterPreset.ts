import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { IdeaStatus } from '@prisma/client'

// Zod schema for FilterState (matching the TypeScript type from filter-utils.ts)
const filterStateSchema = z.object({
  categoryIds: z.array(z.string()),
  statuses: z.array(z.nativeEnum(IdeaStatus)),
  quadrants: z.array(z.enum(['quick-wins', 'major-projects', 'fill-ins', 'thankless-tasks'])),
  originalEffort: z.tuple([z.number(), z.number()]),
  originalValue: z.tuple([z.number(), z.number()]),
  originalWeight: z.tuple([z.number(), z.number()]),
  positionedEffort: z.tuple([z.number(), z.number()]),
  positionedValue: z.tuple([z.number(), z.number()]),
  onlyWithDrift: z.boolean(),
})

export const filterPresetRouter = createTRPCRouter({
  // List all filter presets for a matrix
  list: publicProcedure
    .input(z.object({ impactMatrixId: z.string() }))
    .query(async ({ ctx, input }) => {
      const presets = await ctx.prisma.filterPreset.findMany({
        where: { impactMatrixId: input.impactMatrixId },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return presets
    }),

  // Create new filter preset
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        filters: filterStateSchema,
        impactMatrixId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const preset = await ctx.prisma.filterPreset.create({
        data: {
          name: input.name,
          filters: input.filters,
          impactMatrixId: input.impactMatrixId,
        },
      })
      return preset
    }),

  // Delete filter preset
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.filterPreset.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
