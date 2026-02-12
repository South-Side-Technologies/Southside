import prisma from '../app/lib/db/prisma'

async function main() {
  const email = 'zonatedace@gmail.com'

  console.log(`Adding CONTRACTOR role to ${email}...`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error(`User ${email} not found`)
    process.exit(1)
  }

  console.log(`Current roles: ${user.roles.join(', ')}`)

  // Add CONTRACTOR role if not already present
  const updatedRoles = Array.from(new Set([...user.roles, 'CONTRACTOR']))

  if (updatedRoles.length === user.roles.length) {
    console.log('CONTRACTOR role already present')
  } else {
    const updated = await prisma.user.update({
      where: { email },
      data: { roles: updatedRoles }
    })
    console.log(`✅ Updated roles: ${updated.roles.join(', ')}`)
  }
}

main().catch(console.error).finally(() => process.exit())
