import { stripe } from './client'

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const CONNECT_RETURN_URL = `${BASE_URL}/contractor/payments/onboarding/complete`
const CONNECT_REFRESH_URL = `${BASE_URL}/contractor/payments/onboarding/refresh`

export async function createConnectAccount(email: string, name?: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      metadata: {
        name: name || email,
        createdAt: new Date().toISOString(),
      },
    })

    return {
      success: true,
      accountId: account.id,
    }
  } catch (error) {
    console.error('Error creating Connect account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create account',
    }
  }
}

export async function createOnboardingLink(accountId: string) {
  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: CONNECT_REFRESH_URL,
      return_url: CONNECT_RETURN_URL,
    })

    return {
      success: true,
      url: link.url,
    }
  } catch (error) {
    console.error('Error creating onboarding link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create onboarding link',
    }
  }
}

export async function checkOnboardingStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)

    return {
      success: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirementsNeeded: account.requirements?.currently_due || [],
      requirementsVerified: account.requirements?.eventually_due || [],
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check onboarding status',
    }
  }
}

export async function createTransfer(accountId: string, amount: number, idempotencyKey: string) {
  try {
    const transfer = await stripe.transfers.create(
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination: accountId,
        description: 'Contractor payment',
      },
      {
        idempotencyKey,
      }
    )

    return {
      success: true,
      transferId: transfer.id,
      amount: transfer.amount / 100,
      status: (transfer as any).status || 'pending',
    }
  } catch (error) {
    console.error('Error creating transfer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transfer',
    }
  }
}

export async function getTransferStatus(transferId: string) {
  try {
    const transfer = await stripe.transfers.retrieve(transferId)

    return {
      success: true,
      status: (transfer as any).status || 'pending',
      amount: transfer.amount / 100,
      reversals: (transfer as any).reversals,
    }
  } catch (error) {
    console.error('Error getting transfer status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transfer status',
    }
  }
}

export async function createDashboardLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId)

    return {
      success: true,
      url: loginLink.url,
    }
  } catch (error) {
    console.error('Error creating dashboard link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dashboard link',
    }
  }
}
