import { PrismaClient, IdeaStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Product',
        description: 'Product improvements and new features',
        color: '#3b82f6', // Blue
      },
    }),
    prisma.category.create({
      data: {
        name: 'Infrastructure',
        description: 'Technical infrastructure and architecture',
        color: '#8b5cf6', // Purple
      },
    }),
    prisma.category.create({
      data: {
        name: 'Marketing',
        description: 'Marketing campaigns and initiatives',
        color: '#ec4899', // Pink
      },
    }),
    prisma.category.create({
      data: {
        name: 'Operations',
        description: 'Operational improvements and processes',
        color: '#f59e0b', // Amber
      },
    }),
  ])

  console.log('✓ Created categories:', categories.length)

  // Create sample ideas in different quadrants
  const ideas = await Promise.all([
    // Quick Wins (low effort, high value)
    prisma.idea.create({
      data: {
        title: 'Implement email notifications',
        description: 'Send email notifications for important events',
        effort: 2,
        businessValue: 8,
        status: IdeaStatus.DRAFT,
        categoryId: categories[0].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Add social media share buttons',
        description: 'Enable users to share content on social media',
        effort: 3,
        businessValue: 7,
        status: IdeaStatus.DRAFT,
        categoryId: categories[2].id,
      },
    }),

    // Major Projects (high effort, high value)
    prisma.idea.create({
      data: {
        title: 'Build mobile app',
        description: 'Native mobile applications for iOS and Android',
        effort: 9,
        businessValue: 9,
        status: IdeaStatus.IN_PROGRESS,
        categoryId: categories[0].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Implement AI recommendations',
        description: 'ML-powered personalized recommendations',
        effort: 8,
        businessValue: 8,
        status: IdeaStatus.DRAFT,
        categoryId: categories[0].id,
      },
    }),

    // Fill-Ins (low effort, low value)
    prisma.idea.create({
      data: {
        title: 'Update footer links',
        description: 'Refresh footer navigation and links',
        effort: 1,
        businessValue: 2,
        status: IdeaStatus.COMPLETED,
        categoryId: categories[3].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Add loading spinners',
        description: 'Improve UX with loading indicators',
        effort: 2,
        businessValue: 3,
        status: IdeaStatus.DRAFT,
        categoryId: categories[0].id,
      },
    }),

    // Thankless Tasks (high effort, low value)
    prisma.idea.create({
      data: {
        title: 'Support legacy IE browsers',
        description: 'Add compatibility for Internet Explorer',
        effort: 8,
        businessValue: 1,
        status: IdeaStatus.ARCHIVED,
        categoryId: categories[1].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Migrate to new analytics platform',
        description: 'Switch to different analytics provider',
        effort: 7,
        businessValue: 2,
        status: IdeaStatus.DRAFT,
        categoryId: categories[2].id,
      },
    }),

    // Middle ground ideas
    prisma.idea.create({
      data: {
        title: 'Optimize database queries',
        description: 'Improve database performance and reduce query time',
        effort: 5,
        businessValue: 6,
        status: IdeaStatus.IN_PROGRESS,
        categoryId: categories[1].id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Redesign dashboard',
        description: 'Modern UI redesign of main dashboard',
        effort: 6,
        businessValue: 7,
        status: IdeaStatus.DRAFT,
        categoryId: categories[0].id,
      },
    }),
  ])

  console.log('✓ Created ideas:', ideas.length)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
