import { initTRPC } from '@trpc/server'
import { prisma } from '@/lib/db'
import superjson from 'superjson'

// Create context for tRPC
export const createTRPCContext = async () => {
  return {
    prisma,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
