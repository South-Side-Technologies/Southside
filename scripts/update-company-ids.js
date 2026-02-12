const { PrismaClient } = require('@prisma/client')
const { randomBytes } = require('crypto')

const prisma = new PrismaClient()

function generateCompanyId(companyName) {
  // Create a readable ID from company name + random suffix
  const namePrefix = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12)

  const randomSuffix = randomBytes(4).toString('hex')
  return `${namePrefix}-${randomSuffix}`
}

async function updateCompanyIds() {
  try {
    console.log('Fetching all users with company names...\n')

    // Get all users with company names
    const users = await prisma.user.findMany({
      where: {
        companyName: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        companyId: true,
      },
    })

    // Get unique company names
    const uniqueCompanies = [...new Set(users.map(u => u.companyName))]

    console.log(`Found ${uniqueCompanies.length} unique companies\n`)

    if (uniqueCompanies.length === 0) {
      console.log('⚠️  No companies found to update\n')
      return
    }

    // Update each company with a unique ID
    let updatedCount = 0
    const updates = []

    for (const companyName of uniqueCompanies) {
      if (!companyName) continue

      const companyId = generateCompanyId(companyName)
      const companyUsers = users.filter(u => u.companyName === companyName)

      // Update all users with this company name
      const result = await prisma.user.updateMany({
        where: {
          companyName: companyName,
        },
        data: {
          companyId: companyId,
        },
      })

      updates.push({
        companyName,
        companyId,
        userCount: result.count,
      })

      updatedCount += result.count
    }

    // Display results
    console.log('Updated Companies:')
    console.log('━'.repeat(80))
    updates.forEach(update => {
      console.log(`Company: ${update.companyName}`)
      console.log(`  ID: ${update.companyId}`)
      console.log(`  Users: ${update.userCount}`)
      console.log()
    })

    console.log('━'.repeat(80))
    console.log(`✅ Successfully updated ${updatedCount} total users\n`)

  } catch (error) {
    console.error('❌ Error updating company IDs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateCompanyIds()
