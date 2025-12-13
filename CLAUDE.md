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

**Organization → Project → ImpactMatrix → Ideas/Categories**

Full hierarchical structure with cascade deletes:
- Organization contains Projects
- Project contains ImpactMatrices
- ImpactMatrix contains Ideas and Categories

**Idea Model:**
- id, title, description
- effort (1-10), businessValue (1-10), weight (1-10)
- positionX, positionY (nullable - custom positioning)
- impactMatrixId (required - scoped to matrix)
- categoryId (optional relation)
- status (DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED)
- timestamps

**Category Model:**
- id, name, description
- color (hex for visual differentiation)
- impactMatrixId (required - scoped to matrix)
- ideas (relation)
- timestamps

## Matrix Features

**Interactive Grid (1200x650px):**
- Wider aspect ratio to fit viewport without scrolling
- 10x10 grid with rectangular cells (120px wide x 65px tall)
- **Free positioning:** Drag ideas anywhere on the grid (not just grid snapping)
- Custom positions saved in positionX/positionY fields
- Smooth dragging with reduced activation distance (5px)
- Four quadrants: Quick Wins, Major Projects, Fill-Ins, Thankless Tasks

**Position Drift Tracking:**
- Shows when idea is manually positioned away from its calculated grid position
- Drift indicator displays: Actual scores (E:7 V:8) vs Positioned location (E:8 V:6)
- Amber Move badge with positioned E/V values
- Per-item reset button to snap back to grid position
- Batch "Reset All Positions" button
- Tooltip shows both actual and positioned values

**Inline Editing:**
- Click on effort (E:), business value (V:), or weight (W:) badges to edit
- Press Enter to save, Escape to cancel
- Real-time updates with optimistic UI
- Dragging disabled while editing

**Ideas Side Panel:**
- Toggle on/off with "Show/Hide Ideas Panel" button (grouped with Ideas List button)
- Lists all ideas sorted by priority (business value desc, then effort asc)
- Shows quadrant classification for each idea
- Shows drift indicator for manually positioned ideas
- Full CRUD operations (create, edit, delete)
- Color-coded by category
- Links to full ideas list view
- Fixed 320px width, full height scrollable

**Quick Actions:**
- "New Idea" button on matrix page - create ideas without leaving the matrix view
- Inline category creation in idea form - add categories on-the-fly while creating ideas
- Ideas side panel - quick overview without navigation

**Key Files:**
- `/lib/grid-utils.ts` - Grid configuration, drift detection, position utilities
- `/lib/export-utils.ts` - Excel workbook generation (Ideas, Categories, Metadata, Filter Presets sheets)
- `/components/matrix/idea-card.tsx` - Card with inline editing (E/V/W) and drift indicator
- `/components/matrix/matrix-grid.tsx` - Grid with free positioning support
- `/components/matrix/ideas-side-panel.tsx` - Side panel with CRUD and drift display
- `/components/export/export-button.tsx` - Excel export with popover UI
- `/components/ideas/idea-form-dialog.tsx` - Idea form with weight slider and inline category creation
- `/app/matrix/[id]/page.tsx` - Matrix page with custom positioning, side panel, batch reset, export
- `/server/api/routers/idea.ts` - tRPC router with updateCustomPosition, resetPosition, resetAllPositions
- `/server/api/routers/export.ts` - Excel export tRPC route with base64 download

## Production Deployment

**CLI-First Philosophy:**
- **ALWAYS use CLI tools where possible** - Never use web dashboards for tasks that can be automated
- Automation > Manual processes - Scripts and commands over point-and-click
- Vercel CLI, Git CLI, NPM CLI, Neon CLI are preferred over web interfaces
- Document all CLI commands for reproducibility

**Infrastructure:**
- **Hosting:** Vercel (https://vercel.com/willem4130s-projects/impactmatrix)
- **Database:** Neon PostgreSQL (serverless, auto-scaling, AWS US East 1)
- **Repository:** https://github.com/willem4130/impactmatrix

**Environment Variables (Production):**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `DIRECT_DATABASE_URL` - Direct connection for Prisma migrations
- `POSTGRES_URL` - Alternative PostgreSQL connection string

**Adding Environment Variables via CLI:**
```bash
# Correct syntax: echo value | vercel env add <name> <environment>
DB_URL="postgresql://user:pass@host:port/db"
echo "$DB_URL" | vercel env add DATABASE_URL production
echo "$DB_URL" | vercel env add DIRECT_DATABASE_URL production
echo "$DB_URL" | vercel env add POSTGRES_URL production

# Verify
vercel env ls

# Deploy with new env vars
vercel --prod
```

**Auto-Deployment:**
- Push to `main` branch triggers automatic Vercel deployment
- Build process: `prisma generate && next build`
- Migrations: Run manually with `prisma migrate deploy` against production DATABASE_URL

**Database Seeding:**
```bash
# Seed production database (run once after initial deployment)
DATABASE_URL="<neon-connection-string>" npm run db:seed
```

**Production URLs:**
- Live App: https://impactmatrix.vercel.app
- Dashboard: https://vercel.com/willem4130s-projects/impactmatrix
- Repository: https://github.com/willem4130/impactmatrix

**Common Commands:**
```bash
# Deploy to production
vercel --prod

# Check deployment logs
vercel logs <deployment-url>

# List environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.production
```
