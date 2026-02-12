/**
 * Seed Script: Create Google Drive folders for existing customers
 *
 * This script creates per-customer folders in Google Drive for all existing
 * users in the database. Run this once after setting up Google Drive integration.
 *
 * Usage:
 *   npx ts-node scripts/seed-customer-folders.ts
 */

import { prisma } from '../app/lib/db/prisma'
import { getCustomerFolder } from '../app/lib/storage/google-drive'

async function seedCustomerFolders() {
  console.log('🚀 Starting Google Drive folder creation for existing customers...\n')

  try {
    // Get all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    console.log(`Found ${users.length} users in database\n`)

    if (users.length === 0) {
      console.log('No users found. Nothing to do.')
      return
    }

    let successCount = 0
    let errorCount = 0

    // Create folder for each user
    for (const user of users) {
      try {
        console.log(`📁 Creating folder for: ${user.email}`)

        const folderId = await getCustomerFolder(user.email)

        console.log(`   ✅ Success! Folder ID: ${folderId}`)
        successCount++
      } catch (error) {
        console.error(`   ❌ Failed for ${user.email}:`, error instanceof Error ? error.message : 'Unknown error')
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary:')
    console.log(`   Total users: ${users.length}`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log('='.repeat(50))

    if (errorCount === 0) {
      console.log('\n🎉 All customer folders created successfully!')
    } else {
      console.log('\n⚠️  Some folders failed to create. Check the errors above.')
    }
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed script
seedCustomerFolders()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
