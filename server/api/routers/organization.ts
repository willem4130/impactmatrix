import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const organizationRouter = createTRPCRouter({
  // List all organizations with project counts
  list: publicProcedure.query(async ({ ctx }) => {
    const organizations = await ctx.prisma.organization.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return organizations
  }),

  // Get single organization with its projects
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: input.id },
        include: {
          projects: {
            include: {
              _count: {
                select: { matrices: true },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
      return organization
    }),

  // Create new organization
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.create({
        data: input,
      })
      return organization
    }),

  // Update organization
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const organization = await ctx.prisma.organization.update({
        where: { id },
        data,
      })
      return organization
    }),

  // Delete organization
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.organization.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
