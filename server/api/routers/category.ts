import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
  // List all categories with idea counts
  list: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      include: {
        _count: {
          select: { ideas: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  }),

  // Get single category with its ideas
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.findUnique({
        where: { id: input.id },
        include: {
          ideas: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
      return category
    }),

  // Create new category
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#3b82f6'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.create({
        data: input,
      })
      return category
    }),

  // Update existing category
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required').optional(),
        description: z.string().optional().nullable(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const category = await ctx.prisma.category.update({
        where: { id },
        data,
      })
      return category
    }),

  // Delete category
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.category.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
