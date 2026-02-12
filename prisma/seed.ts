import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      sub: 'test-user-123',
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design',
        status: 'IN_PROGRESS',
        progress: 65,
        startDate: new Date('2026-01-15'),
        estimatedCompletion: new Date('2026-03-30'),
        assignedTeam: ['John Doe', 'Jane Smith'],
        userId: testUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Cloud Migration',
        description: 'Migrate legacy systems to AWS cloud infrastructure',
        status: 'PLANNING',
        progress: 15,
        startDate: new Date('2026-02-01'),
        estimatedCompletion: new Date('2026-05-15'),
        assignedTeam: ['Mike Johnson'],
        userId: testUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Security Audit',
        description: 'Comprehensive security assessment and remediation',
        status: 'REVIEW',
        progress: 90,
        startDate: new Date('2025-12-10'),
        estimatedCompletion: new Date('2026-02-28'),
        assignedTeam: ['Sarah Chen', 'Tom Wilson'],
        userId: testUser.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Integration',
        description: 'Connect CRM with third-party services',
        status: 'COMPLETED',
        progress: 100,
        startDate: new Date('2025-11-01'),
        estimatedCompletion: new Date('2026-01-15'),
        assignedTeam: ['Alice Brown'],
        userId: testUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${projects.length} projects`)

  // Create support tickets
  const tickets = await Promise.all([
    prisma.supportTicket.create({
      data: {
        ticketNumber: '1234',
        subject: 'Website Performance Issues',
        description: 'The website is loading slowly on mobile devices',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: testUser.id,
      },
    }),
    prisma.supportTicket.create({
      data: {
        ticketNumber: '1233',
        subject: 'Request for Additional Cloud Storage',
        description: 'Need 500GB additional storage for project files',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        userId: testUser.id,
      },
    }),
    prisma.supportTicket.create({
      data: {
        ticketNumber: '1232',
        subject: 'Question about Billing Cycle',
        description: 'When will the next invoice be generated?',
        status: 'CLOSED',
        priority: 'LOW',
        userId: testUser.id,
      },
    }),
    prisma.supportTicket.create({
      data: {
        ticketNumber: '1231',
        subject: 'API Integration Documentation',
        description: 'Need updated documentation for the REST API',
        status: 'OPEN',
        priority: 'MEDIUM',
        userId: testUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${tickets.length} support tickets`)

  // Create documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        name: 'Service Agreement 2026.pdf',
        type: 'pdf',
        size: BigInt(1024 * 250),
        category: 'CONTRACT',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
    prisma.document.create({
      data: {
        name: 'Invoice_INV-2026-001.pdf',
        type: 'pdf',
        size: BigInt(1024 * 120),
        category: 'INVOICE',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
    prisma.document.create({
      data: {
        name: 'Q1_Progress_Report.pdf',
        type: 'pdf',
        size: BigInt(1024 * 1024 * 2.5),
        category: 'REPORT',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
    prisma.document.create({
      data: {
        name: 'Technical_Documentation.docx',
        type: 'docx',
        size: BigInt(1024 * 450),
        category: 'DOCUMENTATION',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
    prisma.document.create({
      data: {
        name: 'Project_Timeline.xlsx',
        type: 'xlsx',
        size: BigInt(1024 * 85),
        category: 'REPORT',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${documents.length} documents`)

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      plan: 'Professional Plan',
      billing: 'MONTHLY',
      amount: 2500.0,
      nextBillingDate: new Date('2026-02-15'),
      paymentMethod: JSON.stringify({
        type: 'card',
        last4: '4242',
      }),
      userId: testUser.id,
    },
  })

  console.log('✅ Created subscription')

  // Create invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-002',
        date: new Date('2026-02-01'),
        amount: 2500.0,
        status: 'PAID',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-001',
        date: new Date('2026-01-01'),
        amount: 2500.0,
        status: 'PAID',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-012',
        date: new Date('2025-12-01'),
        amount: 2500.0,
        status: 'PAID',
        downloadUrl: '#',
        userId: testUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${invoices.length} invoices`)

  console.log('🌱 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
