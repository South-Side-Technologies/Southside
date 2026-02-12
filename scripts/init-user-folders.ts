import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeUserFolders() {
  try {
    console.log('Starting folder initialization...')

    // Get all users
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users`)

    const defaultFolders = ['Billing', 'Technical']

    for (const user of users) {
      for (const folderName of defaultFolders) {
        // Check if folder already exists
        const existingFolder = await prisma.folder.findUnique({
          where: {
            userId_name: {
              userId: user.id,
              name: folderName,
            },
          },
        })

        if (!existingFolder) {
          const folder = await prisma.folder.create({
            data: {
              name: folderName,
              userId: user.id,
            },
          })
          console.log(`✓ Created "${folderName}" folder for user ${user.email}`)
        } else {
          console.log(`✓ "${folderName}" folder already exists for user ${user.email}`)
        }
      }
    }

    console.log('\nFolder initialization complete!')
  } catch (error) {
    console.error('Error initializing folders:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initializeUserFolders()
