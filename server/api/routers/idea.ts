import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { IdeaStatus } from '@prisma/client'

export const ideaRouter = createTRPCRouter({
  // List all ideas with optional filtering
  list: publicProcedure
    .input(
      z
        .object({
          impactMatrixId: z.string().optional(),
          categoryId: z.string().optional(),
          status: z.nativeEnum(IdeaStatus).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const ideas = await ctx.prisma.idea.findMany({
        where: {
          ...(input?.impactMatrixId && { impactMatrixId: input.impactMatrixId }),
          ...(input?.categoryId && { categoryId: input.categoryId }),
          ...(input?.status && { status: input.status }),
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return ideas
    }),

  // Get single idea by ID
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const idea = await ctx.prisma.idea.findUnique({
        where: { id: input.id },
        include: {
          category: true,
        },
      })
      return idea
    }),

  // Create new idea
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        effort: z.number().int().min(1).max(10).default(5),
        businessValue: z.number().int().min(1).max(10).default(5),
        weight: z.number().int().min(1).max(10).default(5),
        impactMatrixId: z.string(),
        categoryId: z.string().optional(),
        status: z.nativeEnum(IdeaStatus).default(IdeaStatus.DRAFT),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.idea.create({
        data: input,
        include: {
          category: true,
        },
      })
      return idea
    }),

  // Update existing idea
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Title is required').optional(),
        description: z.string().optional().nullable(),
        effort: z.number().int().min(1).max(10).optional(),
        businessValue: z.number().int().min(1).max(10).optional(),
        weight: z.number().int().min(1).max(10).optional(),
        categoryId: z.string().optional().nullable(),
        status: z.nativeEnum(IdeaStatus).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const idea = await ctx.prisma.idea.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      })
      return idea
    }),

  // Update idea position (for drag & drop on matrix)
  updatePosition: publicProcedure
    .input(
      z.object({
        id: z.string(),
        effort: z.number().int().min(1).max(10),
        businessValue: z.number().int().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.idea.update({
        where: { id: input.id },
        data: {
          effort: input.effort,
          businessValue: input.businessValue,
        },
        include: {
          category: true,
        },
      })
      return idea
    }),

  // Update custom position (for free positioning on matrix)
  updateCustomPosition: publicProcedure
    .input(
      z.object({
        id: z.string(),
        positionX: z.number(),
        positionY: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.idea.update({
        where: { id: input.id },
        data: {
          positionX: input.positionX,
          positionY: input.positionY,
        },
        include: {
          category: true,
        },
      })
      return idea
    }),

  // Reset idea position (clear manual positioning, use calculated position)
  resetPosition: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.idea.update({
        where: { id: input.id },
        data: {
          positionX: null,
          positionY: null,
        },
        include: {
          category: true,
        },
      })
      return idea
    }),

  // Reset all positions for a matrix
  resetAllPositions: publicProcedure
    .input(z.object({ impactMatrixId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.idea.updateMany({
        where: { impactMatrixId: input.impactMatrixId },
        data: {
          positionX: null,
          positionY: null,
        },
      })
      return { success: true }
    }),

  // Delete idea
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.idea.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
