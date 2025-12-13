import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const impactMatrixRouter = createTRPCRouter({
  // List all matrices (optionally filtered by project)
  list: publicProcedure
    .input(
      z
        .object({
          projectId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const matrices = await ctx.prisma.impactMatrix.findMany({
        where: input?.projectId ? { projectId: input.projectId } : undefined,
        include: {
          project: {
            include: {
              organization: true,
            },
          },
          _count: {
            select: { ideas: true, categories: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return matrices
    }),

  // Get single matrix with its data
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const matrix = await ctx.prisma.impactMatrix.findUnique({
        where: { id: input.id },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
          categories: {
            include: {
              _count: {
                select: { ideas: true },
              },
            },
            orderBy: {
              name: 'asc',
            },
          },
          ideas: {
            include: {
              category: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
      return matrix
    }),

  // Create new impact matrix
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const matrix = await ctx.prisma.impactMatrix.create({
        data: input,
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      })
      return matrix
    }),

  // Update impact matrix
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const matrix = await ctx.prisma.impactMatrix.update({
        where: { id },
        data,
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      })
      return matrix
    }),

  // Delete impact matrix
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.impactMatrix.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // Duplicate impact matrix with all ideas and categories
  duplicate: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch original matrix with all related data
      const originalMatrix = await ctx.prisma.impactMatrix.findUnique({
        where: { id: input.id },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
          categories: true,
          ideas: true,
        },
      })

      if (!originalMatrix) {
        throw new Error('Impact matrix not found')
      }

      // Create new matrix with "(Copy)" suffix
      const newMatrix = await ctx.prisma.impactMatrix.create({
        data: {
          name: `${originalMatrix.name} (Copy)`,
          description: originalMatrix.description,
          projectId: originalMatrix.projectId,
        },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
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

      return newMatrix
    }),
})
