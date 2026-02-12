const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateUserRole() {
  try {
    console.log('Checking user: zonatedace@gmail.com\n')

    const user = await prisma.user.findUnique({
      where: { email: 'zonatedace@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('Current Role:')
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Role: ${user.role}`)

    if (user.role !== 'ADMIN') {
      console.log('\nUpdating role to ADMIN...')
      const updated = await prisma.user.update({
        where: { email: 'zonatedace@gmail.com' },
        data: { role: 'ADMIN' },
        select: {
          email: true,
          role: true,
        },
      })
      console.log(`✓ Updated to: ${updated.role}\n`)
    } else {
      console.log('✓ Already has ADMIN role\n')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRole()
