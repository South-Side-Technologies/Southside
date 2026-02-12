/**
 * Cloudflare Access Groups Management
 *
 * Note: For automatic user addition to Access Groups, you need to configure
 * your Cloudflare Access Group rules to include users automatically.
 *
 * Recommended Configuration:
 *
 * 1. Create "clients" Access Group in Cloudflare Zero Trust Dashboard:
 *    - Go to Access > Access Groups
 *    - Create new group named "clients"
 *    - Add include rule: "Everyone" OR specific email domains
 *    - Add exclude rule: Group "admins" (to make roles mutually exclusive)
 *
 * 2. This ensures all authenticated users are automatically added to "clients"
 *    group when they authenticate through Cloudflare Access
 *
 * Alternative: Use Cloudflare API to manage group membership programmatically
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareAccessGroupRule {
  email?: {
    email: string
  }
  email_domain?: {
    domain: string
  }
  everyone?: Record<string, never>
  [key: string]: unknown
}

interface CloudflareAccessGroup {
  id: string
  name: string
  include: CloudflareAccessGroupRule[]
  exclude?: CloudflareAccessGroupRule[]
  require?: CloudflareAccessGroupRule[]
}

/**
 * Add a user's email to a Cloudflare Access Group
 *
 * NOTE: This requires Cloudflare API Token with Access:Edit permissions
 * and is not recommended for production use. Instead, configure Access Groups
 * with rules to automatically include users based on criteria.
 *
 * @param email - User email to add to the group
 * @param groupName - Name of the Access Group (e.g., 'clients')
 */
export async function addUserToAccessGroup(
  email: string,
  groupName: string = 'clients'
): Promise<{ success: boolean; message: string }> {
  // Check for required environment variables
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!accountId || !apiToken) {
    console.warn(
      'Cloudflare API credentials not configured. ' +
      'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to enable automatic group management.'
    )
    return {
      success: false,
      message: 'Cloudflare API not configured - configure Access Group rules instead',
    }
  }

  try {
    // 1. Get all Access Groups
    const groupsResponse = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/access/groups`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!groupsResponse.ok) {
      throw new Error(`Failed to fetch Access Groups: ${groupsResponse.statusText}`)
    }

    const groupsData = await groupsResponse.json() as { result: CloudflareAccessGroup[] }
    const targetGroup = groupsData.result.find(g => g.name === groupName)

    if (!targetGroup) {
      throw new Error(`Access Group "${groupName}" not found`)
    }

    // 2. Check if email is already in the group
    const emailAlreadyIncluded = targetGroup.include.some(
      rule => rule.email?.email === email
    )

    if (emailAlreadyIncluded) {
      return {
        success: true,
        message: `User ${email} already in ${groupName} group`,
      }
    }

    // 3. Add email to the include rules
    const updatedInclude = [
      ...targetGroup.include,
      { email: { email } },
    ]

    // 4. Update the Access Group
    const updateResponse = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/access/groups/${targetGroup.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: targetGroup.name,
          include: updatedInclude,
          exclude: targetGroup.exclude || [],
          require: targetGroup.require || [],
        }),
      }
    )

    if (!updateResponse.ok) {
      throw new Error(`Failed to update Access Group: ${updateResponse.statusText}`)
    }

    console.log(`Added ${email} to Cloudflare Access Group "${groupName}"`)

    return {
      success: true,
      message: `User ${email} added to ${groupName} group`,
    }
  } catch (error) {
    console.error('Error adding user to Access Group:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Remove a user's email from a Cloudflare Access Group
 *
 * @param email - User email to remove from the group
 * @param groupName - Name of the Access Group (e.g., 'clients')
 */
export async function removeUserFromAccessGroup(
  email: string,
  groupName: string = 'clients'
): Promise<{ success: boolean; message: string }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!accountId || !apiToken) {
    return {
      success: false,
      message: 'Cloudflare API not configured',
    }
  }

  try {
    // 1. Get all Access Groups
    const groupsResponse = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/access/groups`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!groupsResponse.ok) {
      throw new Error(`Failed to fetch Access Groups: ${groupsResponse.statusText}`)
    }

    const groupsData = await groupsResponse.json() as { result: CloudflareAccessGroup[] }
    const targetGroup = groupsData.result.find(g => g.name === groupName)

    if (!targetGroup) {
      throw new Error(`Access Group "${groupName}" not found`)
    }

    // 2. Remove email from include rules
    const updatedInclude = targetGroup.include.filter(
      rule => rule.email?.email !== email
    )

    // 3. Update the Access Group
    const updateResponse = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/access/groups/${targetGroup.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: targetGroup.name,
          include: updatedInclude,
          exclude: targetGroup.exclude || [],
          require: targetGroup.require || [],
        }),
      }
    )

    if (!updateResponse.ok) {
      throw new Error(`Failed to update Access Group: ${updateResponse.statusText}`)
    }

    console.log(`Removed ${email} from Cloudflare Access Group "${groupName}"`)

    return {
      success: true,
      message: `User ${email} removed from ${groupName} group`,
    }
  } catch (error) {
    console.error('Error removing user from Access Group:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
