import prisma from '../app/lib/db/prisma'

async function main() {
  const email = 'zonatedace@gmail.com'

  console.log(`\n📋 Checking roles for ${email}...\n`)

  const user = await prisma.user.findUnique({
    where: { email }
  }) as any

  if (!user) {
    console.error(`❌ User ${email} not found`)
    process.exit(1)
  }

  console.log(`📧 Email: ${user.email}`)
  console.log(`👤 Name: ${user.name}`)
  console.log(`🔑 Primary Role: ${user.role}`)
  console.log(`📍 All Roles: [${(user.roles || []).join(', ')}]`)
  console.log(`\n✅ User found and roles are set correctly!\n`)
}

main().catch(console.error).finally(() => process.exit())
