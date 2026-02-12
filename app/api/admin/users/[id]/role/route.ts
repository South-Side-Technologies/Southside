import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth/get-current-user'
import { isAdmin } from '../../../../../lib/auth/roles'
import prisma from '../../../../../lib/db/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    // Check if user is authenticated and is admin
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, roles: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()

    // Check if user is authenticated and is admin
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id
    const body = await request.json()
    const { role, roles } = body

    const validRoles = ['ADMIN', 'CONTRACTOR', 'CLIENT']

    // Support both new 'roles' array and legacy 'role' field
    let newRoles: string[] = []
    let newRole: string = 'CLIENT'

    if (roles && Array.isArray(roles)) {
      // New format: multiple roles
      if (roles.length === 0) {
        return NextResponse.json(
          { error: 'User must have at least one role' },
          { status: 400 }
        )
      }

      // Validate all roles
      for (const r of roles) {
        if (!validRoles.includes(r)) {
          return NextResponse.json(
            { error: `Invalid role "${r}". Must be one of: ${validRoles.join(', ')}` },
            { status: 400 }
          )
        }
      }

      newRoles = roles
      // Set primary role: ADMIN > CONTRACTOR > CLIENT
      newRole = roles.includes('ADMIN') ? 'ADMIN' : roles.includes('CONTRACTOR') ? 'CONTRACTOR' : 'CLIENT'
    } else if (role) {
      // Legacy format: single role
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        )
      }
      newRoles = [role]
      newRole = role
    } else {
      return NextResponse.json(
        { error: 'Missing role or roles field' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent changing own admin role (require at least one admin)
    if (currentUser.id === userId && isAdmin(currentUser) && !newRoles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Cannot remove admin role from yourself' },
        { status: 400 }
      )
    }

    // Update user roles
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        roles: newRoles,
      },
      select: { id: true, email: true, name: true, role: true, roles: true },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
