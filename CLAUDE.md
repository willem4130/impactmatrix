# Impact Matrix

A web application for managing organizational improvement ideas with visual prioritization using an effort vs. business returns matrix.

## Project Structure

```
app/
  ├── api/                    # tRPC API routes
  │   └── trpc/[trpc]/       # tRPC endpoint handler
  ├── ideas/                 # Ideas management pages
  ├── categories/            # Categories management pages
  ├── matrix/                # Interactive grid visualization
  └── layout.tsx             # Root layout
components/
  ├── ui/                    # shadcn/ui components
  ├── ideas/                 # Idea-related components
  ├── categories/            # Category-related components
  └── matrix/                # Matrix grid components
lib/
  ├── db.ts                  # Prisma client
  ├── utils.ts               # Utility functions
  └── grid-utils.ts          # Grid positioning logic
server/
  └── api/
      ├── routers/           # tRPC route definitions
      ├── root.ts            # Main router
      └── trpc.ts            # tRPC configuration
prisma/
  ├── schema.prisma          # Database schema
  └── migrations/            # Database migrations
```

## Organization Rules

**Keep code organized and modularized:**
- API routes → `/server/api/routers`, one file per resource (idea.ts, category.ts)
- UI components → `/components/ui` (shadcn/ui only)
- Feature components → `/components/{feature}`, one component per file
- Pages → `/app/{route}`, following Next.js App Router conventions
- Database schema → `/prisma/schema.prisma`
- Utilities → `/lib`, grouped by functionality

**Modularity principles:**
- Single responsibility per file
- Clear, descriptive file names
- Group related functionality together
- Avoid monolithic files
- Keep components small and composable

## Code Quality - Zero Tolerance

After editing ANY file, run:

```bash
npm run lint
npm run typecheck
```

Fix ALL errors/warnings before continuing.

If changes require server restart (not hot-reloadable):
1. Restart dev server: `npm run dev`
2. Read server output/logs
3. Fix ALL warnings/errors before continuing

## Tech Stack

- **Framework:** Next.js 16 with TypeScript & App Router
- **Database:** PostgreSQL with Prisma ORM
- **API:** tRPC for type-safe APIs
- **UI:** shadcn/ui + Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Drag & Drop:** @dnd-kit/core
- **State:** React Query (via tRPC)

## Database Schema

**Idea Model:**
- id, title, description
- effort (1-10), businessValue (1-10)
- positionX, positionY (grid coordinates)
- categoryId (optional relation)
- status (draft, in-progress, completed)
- timestamps

**Category Model:**
- id, name, description
- color (hex for visual differentiation)
- ideas (relation)
- timestamps
