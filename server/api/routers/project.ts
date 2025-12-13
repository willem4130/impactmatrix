import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const projectRouter = createTRPCRouter({
  // List all projects (optionally filtered by organization)
  list: publicProcedure
    .input(
      z
        .object({
          organizationId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const projects = await ctx.prisma.project.findMany({
        where: input?.organizationId
          ? { organizationId: input.organizationId }
          : undefined,
        include: {
          organization: true,
          _count: {
            select: { matrices: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return projects
    }),

  // Get single project with its matrices
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          organization: true,
          matrices: {
            include: {
              _count: {
                select: { ideas: true, categories: true },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
      return project
    }),

  // Create new project
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: input,
        include: {
          organization: true,
        },
      })
      return project
    }),

  // Update project
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const project = await ctx.prisma.project.update({
        where: { id },
        data,
        include: {
          organization: true,
        },
      })
      return project
    }),

  // Delete project
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.project.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
