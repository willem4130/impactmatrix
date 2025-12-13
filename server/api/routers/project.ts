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

  // Duplicate project with all matrices, ideas, and categories
  duplicate: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch original project with all related data
      const originalProject = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          organization: true,
          matrices: {
            include: {
              categories: true,
              ideas: true,
            },
          },
        },
      })

      if (!originalProject) {
        throw new Error('Project not found')
      }

      // Create new project with "(Copy)" suffix
      const newProject = await ctx.prisma.project.create({
        data: {
          name: `${originalProject.name} (Copy)`,
          description: originalProject.description,
          organizationId: originalProject.organizationId,
        },
        include: {
          organization: true,
        },
      })

      // Duplicate each matrix with its categories and ideas
      for (const originalMatrix of originalProject.matrices) {
        // Create new matrix
        const newMatrix = await ctx.prisma.impactMatrix.create({
          data: {
            name: `${originalMatrix.name} (Copy)`,
            description: originalMatrix.description,
            projectId: newProject.id,
          },
        })

        // Create category mapping (old ID -> new ID)
        const categoryMap = new Map<string, string>()

        // Duplicate categories
        for (const originalCategory of originalMatrix.categories) {
          const newCategory = await ctx.prisma.category.create({
            data: {
              name: originalCategory.name,
              description: originalCategory.description,
              color: originalCategory.color,
              impactMatrixId: newMatrix.id,
            },
          })
          categoryMap.set(originalCategory.id, newCategory.id)
        }

        // Duplicate ideas (reset custom positions)
        for (const originalIdea of originalMatrix.ideas) {
          await ctx.prisma.idea.create({
            data: {
              title: originalIdea.title,
              description: originalIdea.description,
              effort: originalIdea.effort,
              businessValue: originalIdea.businessValue,
              weight: originalIdea.weight,
              status: originalIdea.status,
              impactMatrixId: newMatrix.id,
              // Map to new category ID if exists
              categoryId: originalIdea.categoryId
                ? categoryMap.get(originalIdea.categoryId)
                : null,
              // Reset custom positions to use grid positions
              positionX: null,
              positionY: null,
            },
          })
        }
      }

      return newProject
    }),
})
