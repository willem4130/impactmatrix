import { PrismaClient, IdeaStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create organizations
  const acmeCorp = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      description: 'Leading innovation company',
    },
  })

  const techStartup = await prisma.organization.create({
    data: {
      name: 'TechStartup Inc',
      description: 'Fast-growing technology startup',
    },
  })

  console.log('✓ Created organizations: 2')

  // Create projects for Acme Corp
  const webProject = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete website overhaul project',
      organizationId: acmeCorp.id,
    },
  })

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile App',
      description: 'New mobile application development',
      organizationId: acmeCorp.id,
    },
  })

  // Create project for TechStartup
  const platformProject = await prisma.project.create({
    data: {
      name: 'Platform Development',
      description: 'Core platform features and improvements',
      organizationId: techStartup.id,
    },
  })

  console.log('✓ Created projects: 3')

  // Create impact matrices
  const q1Matrix = await prisma.impactMatrix.create({
    data: {
      name: 'Q1 2025 Initiatives',
      description: 'First quarter improvement priorities',
      projectId: webProject.id,
    },
  })

  const q2Matrix = await prisma.impactMatrix.create({
    data: {
      name: 'Q2 2025 Planning',
      description: 'Second quarter roadmap',
      projectId: mobileProject.id,
    },
  })

  const platformMatrix = await prisma.impactMatrix.create({
    data: {
      name: 'Platform Improvements',
      description: 'Ongoing platform enhancement ideas',
      projectId: platformProject.id,
    },
  })

  console.log('✓ Created impact matrices: 3')

  // Create categories for Q1 Matrix
  const productCategory = await prisma.category.create({
    data: {
      name: 'Product',
      description: 'Product improvements and new features',
      color: '#3b82f6', // Blue
      impactMatrixId: q1Matrix.id,
    },
  })

  const infrastructureCategory = await prisma.category.create({
    data: {
      name: 'Infrastructure',
      description: 'Technical infrastructure and architecture',
      color: '#8b5cf6', // Purple
      impactMatrixId: q1Matrix.id,
    },
  })

  const marketingCategory = await prisma.category.create({
    data: {
      name: 'Marketing',
      description: 'Marketing campaigns and initiatives',
      color: '#ec4899', // Pink
      impactMatrixId: q1Matrix.id,
    },
  })

  const operationsCategory = await prisma.category.create({
    data: {
      name: 'Operations',
      description: 'Operational improvements and processes',
      color: '#f59e0b', // Amber
      impactMatrixId: q1Matrix.id,
    },
  })

  // Create categories for Q2 Matrix
  const mobileCategory = await prisma.category.create({
    data: {
      name: 'Mobile Features',
      description: 'Mobile-specific features',
      color: '#10b981', // Green
      impactMatrixId: q2Matrix.id,
    },
  })

  const uxCategory = await prisma.category.create({
    data: {
      name: 'UX/UI',
      description: 'User experience improvements',
      color: '#f97316', // Orange
      impactMatrixId: q2Matrix.id,
    },
  })

  console.log('✓ Created categories: 6')

  // Create sample ideas for Q1 Matrix - different quadrants
  await Promise.all([
    // Quick Wins (low effort, high value)
    prisma.idea.create({
      data: {
        title: 'Implement email notifications',
        description: 'Send email notifications for important events',
        effort: 2,
        businessValue: 8,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q1Matrix.id,
        categoryId: productCategory.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Add social media share buttons',
        description: 'Enable users to share content on social media',
        effort: 3,
        businessValue: 7,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q1Matrix.id,
        categoryId: marketingCategory.id,
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
        impactMatrixId: q1Matrix.id,
        categoryId: productCategory.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Implement AI recommendations',
        description: 'ML-powered personalized recommendations',
        effort: 8,
        businessValue: 8,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q1Matrix.id,
        categoryId: productCategory.id,
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
        impactMatrixId: q1Matrix.id,
        categoryId: operationsCategory.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Add loading spinners',
        description: 'Improve UX with loading indicators',
        effort: 2,
        businessValue: 3,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q1Matrix.id,
        categoryId: productCategory.id,
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
        impactMatrixId: q1Matrix.id,
        categoryId: infrastructureCategory.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Migrate to new analytics platform',
        description: 'Switch to different analytics provider',
        effort: 7,
        businessValue: 2,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q1Matrix.id,
        categoryId: marketingCategory.id,
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
        impactMatrixId: q1Matrix.id,
        categoryId: infrastructureCategory.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Redesign dashboard',
        description: 'Modern UI redesign of main dashboard',
        effort: 6,
        businessValue: 7,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q1Matrix.id,
        categoryId: productCategory.id,
      },
    }),

    // Add some ideas to Q2 Matrix
    prisma.idea.create({
      data: {
        title: 'Push notifications',
        description: 'Implement push notifications for mobile',
        effort: 4,
        businessValue: 8,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q2Matrix.id,
        categoryId: mobileCategory.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Dark mode',
        description: 'Add dark mode theme option',
        effort: 3,
        businessValue: 6,
        status: IdeaStatus.DRAFT,
        impactMatrixId: q2Matrix.id,
        categoryId: uxCategory.id,
      },
    }),
  ])

  console.log('✓ Created ideas: 12')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`  - Organizations: 2 (Acme Corporation, TechStartup Inc)`)
  console.log(`  - Projects: 3 (Website Redesign, Mobile App, Platform Development)`)
  console.log(`  - Impact Matrices: 3 (Q1 2025, Q2 2025, Platform Improvements)`)
  console.log(`  - Categories: 6`)
  console.log(`  - Ideas: 12`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
