import { createTRPCRouter } from './trpc'
import { organizationRouter } from './routers/organization'
import { projectRouter } from './routers/project'
import { impactMatrixRouter } from './routers/impactMatrix'
import { ideaRouter } from './routers/idea'
import { categoryRouter } from './routers/category'

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  project: projectRouter,
  impactMatrix: impactMatrixRouter,
  idea: ideaRouter,
  category: categoryRouter,
})

export type AppRouter = typeof appRouter
