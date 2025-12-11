import { createTRPCRouter } from './trpc'
import { ideaRouter } from './routers/idea'
import { categoryRouter } from './routers/category'

export const appRouter = createTRPCRouter({
  idea: ideaRouter,
  category: categoryRouter,
})

export type AppRouter = typeof appRouter
