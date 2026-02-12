import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'
import { stripe } from '@/app/lib/stripe/client'
import { calculatePayoutFees } from '@/app/lib/stripe/fees'
import { v4 as uuidv4 } from 'uuid'

interface PaymentRequest {
  contractorId: string
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireAdmin(session.user)

    const body = await request.json()
    const { payments } = body

    if (!Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({ error: 'No payments specified' }, { status: 400 })
    }

    const batchId = uuidv4()
    const results = []

    for (const payment of payments) {
      const { contractorId, amount } = payment as PaymentRequest

      try {
        const contractor = await prisma.user.findUnique({
          where: { id: contractorId },
          select: {
            id: true,
            email: true,
            stripeConnectAccountId: true,
            stripeOnboardingComplete: true,
          },
        })

        if (!contractor) {
          results.push({
            contractorId,
            success: false,
            error: 'Contractor not found',
          })
          continue
        }

        if (!contractor.stripeOnboardingComplete || !contractor.stripeConnectAccountId) {
          results.push({
            contractorId,
            success: false,
            error: 'Contractor has not completed onboarding',
          })
          continue
        }

        // Calculate Stripe Connect fees (0.25% + $0.25 per payout)
        const feeDetails = calculatePayoutFees(amount)
        const netAmount = feeDetails.netAmount

        console.log(
          `[Payout] Contractor: ${contractorId}, Gross: $${amount.toFixed(2)}, ` +
          `Fee: $${feeDetails.stripeFeeAmount.toFixed(2)}, Net: $${netAmount.toFixed(2)}`
        )

        const idempotencyKey = `payout-${batchId}-${contractorId}`

        // Send net amount to contractor (amount minus fees)
        const transfer = await stripe.transfers.create(
          {
            amount: Math.round(netAmount * 100), // Send net amount after fees
            currency: 'usd',
            destination: contractor.stripeConnectAccountId,
            description: `Batch payout ${batchId}`,
          },
          {
            idempotencyKey,
          }
        )

        const payout = await prisma.contractorPayout.create({
          data: {
            contractorId,
            batchId,
            stripeTransferId: transfer.id,
            amount, // Store gross amount
            stripeFeeAmount: feeDetails.stripeFeeAmount, // Store fee for transparency
            netAmount, // Store net amount contractor receives
            status: 'PROCESSING',
            processedBy: session.user.id,
          },
        })

        await prisma.projectAssignment.updateMany(
          {
            where: {
              userId: contractorId,
              paymentStatus: 'PENDING',
            },
          },
          {
            paymentStatus: 'PROCESSING',
            payoutId: payout.id,
          }
        )

        results.push({
          contractorId,
          success: true,
          transferId: transfer.id,
          payoutId: payout.id,
          grossAmount: amount,
          stripeFeeAmount: feeDetails.stripeFeeAmount,
          netAmount,
        })
      } catch (err) {
        console.error(`Error processing payment for ${contractorId}:`, err)
        results.push({
          contractorId,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      batchId,
      processed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error: any) {
    console.error('Error processing batch payments:', error)
    return NextResponse.json(
      { error: 'Failed to process payments' },
      { status: 500 }
    )
  }
}
