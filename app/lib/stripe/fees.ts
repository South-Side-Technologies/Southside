/**
 * Stripe Fee Calculation Utility
 * Handles calculation of Stripe processing and Connect fees
 */

export interface StripeFeesResult {
  stripeFeeAmount: number
  connectFeeAmount: number
  platformFeeAmount: number
  netAmount: number
}

/**
 * Calculate Stripe processing fees for client payments
 *
 * Standard Stripe fees:
 * - Card payments: 2.9% + $0.30
 * - Bank transfers: 1% + $0.30 (minimum $0.30)
 *
 * For simplicity, we use card payment rates as default
 */
export function calculatePaymentFees(amount: number, paymentMethod: 'card' | 'bank' = 'card'): StripeFeesResult {
  let stripeFeeAmount = 0

  if (paymentMethod === 'card') {
    // 2.9% + $0.30
    stripeFeeAmount = amount * 0.029 + 0.30
  } else if (paymentMethod === 'bank') {
    // 1% + $0.30 (minimum $0.30)
    stripeFeeAmount = Math.max(amount * 0.01 + 0.30, 0.30)
  }

  const platformFeeAmount = stripeFeeAmount
  const netAmount = amount - platformFeeAmount

  return {
    stripeFeeAmount,
    connectFeeAmount: 0,
    platformFeeAmount,
    netAmount,
  }
}

/**
 * Calculate Stripe Connect fees for contractor payouts
 *
 * Stripe Connect usage fees (optional pricing model):
 * - Account management: $2 per active connected account per month
 * - Payout fees: 0.25% of payout volume + $0.25 per payout
 *
 * The $2/month fee is not per-payout, so we focus on per-payout fees
 */
export interface PayoutFeeOptions {
  includeMonthlyAccountFee?: boolean
  accountFeeAmount?: number // Pre-calculated monthly fee, can be amortized per payout
}

export function calculatePayoutFees(amount: number, options: PayoutFeeOptions = {}): StripeFeesResult {
  const { includeMonthlyAccountFee = false, accountFeeAmount = 0 } = options

  // Per-payout fee: 0.25% + $0.25
  const perPayoutFee = amount * 0.0025 + 0.25

  // Optional monthly account fee (amortized if provided)
  const monthlyFeeComponent = includeMonthlyAccountFee ? accountFeeAmount : 0

  const connectFeeAmount = perPayoutFee + monthlyFeeComponent
  const platformFeeAmount = connectFeeAmount
  const netAmount = amount - platformFeeAmount

  return {
    stripeFeeAmount: perPayoutFee,
    connectFeeAmount,
    platformFeeAmount,
    netAmount,
  }
}

/**
 * Combined fee calculation for full payment lifecycle
 *
 * When a client payment is processed:
 * 1. Platform receives: amount - stripeFeeAmount
 * 2. When paying contractor: contractor amount - connectFeeAmount
 */
export function calculateTotalPaymentChain(
  clientPaymentAmount: number,
  contractorPayoutAmount: number,
  paymentMethod: 'card' | 'bank' = 'card'
): {
  clientPayment: StripeFeesResult
  contractorPayout: StripeFeesResult
  platformMargin: number
} {
  const clientPayment = calculatePaymentFees(clientPaymentAmount, paymentMethod)
  const contractorPayout = calculatePayoutFees(contractorPayoutAmount)

  // Platform margin: what platform keeps from client payment that goes to contractor payout
  const platformMargin = clientPayment.netAmount - contractorPayoutAmount

  return {
    clientPayment,
    contractorPayout,
    platformMargin,
  }
}

/**
 * Format fees for display
 */
export function formatFees(fees: StripeFeesResult): string {
  return `Stripe: $${fees.stripeFeeAmount.toFixed(2)}, Connect: $${fees.connectFeeAmount.toFixed(2)}, Total: $${fees.platformFeeAmount.toFixed(2)}`
}

/**
 * Calculate contractor net payout after all fees
 *
 * This is useful when determining how much to actually send to contractor
 * given their earned amount
 */
export function getContractorNetPayout(earnedAmount: number): StripeFeesResult {
  return calculatePayoutFees(earnedAmount)
}

/**
 * Calculate what to charge client for contractor work
 *
 * If contractor earns $100, and we want 20% platform margin:
 * - Contractor should receive: $100
 * - Client should pay: $100 + platform margin - (client payment fees)
 */
export function calculateClientChargeForContractorEarnings(
  contractorEarned: number,
  platformMarginPercent: number = 0.2 // 20% platform margin
): {
  clientChargeAmount: number
  afterFees: number
  platformKeeps: number
} {
  // Start with contractor earnings
  const baseAmount = contractorEarned

  // Calculate contractor payout fees (what will be deducted when paying them)
  const initialPayoutFees = calculatePayoutFees(baseAmount)

  // Total amount platform needs to receive to pay contractor
  const amountPlatformNeeds = baseAmount // We'll deduct fees from this
  const platformFees = initialPayoutFees.platformFeeAmount

  // Client charge = amount + (amount * marginPercent) to cover platform margin + fees
  // We need to solve for: (clientCharge - clientFees) - payoutFees = contractorEarnings
  // Simplified: clientCharge * (1 - 0.029) - 0.30 - (baseAmount * 0.0025 + 0.25) = contractorEarned

  // Iteratively solve for client charge
  let clientCharge = baseAmount * 1.3 // Start with estimate
  for (let i = 0; i < 10; i++) {
    const clientFees = calculatePaymentFees(clientCharge)
    const payoutFees = calculatePayoutFees(contractorEarned)
    const totalFees = clientFees.platformFeeAmount + payoutFees.platformFeeAmount
    const needed = contractorEarned + totalFees + (contractorEarned * platformMarginPercent)
    clientCharge = needed / 0.971 // Approximate adjustment
  }

  const clientFees = calculatePaymentFees(clientCharge)
  const payoutFees = calculatePayoutFees(contractorEarned)

  return {
    clientChargeAmount: Math.round(clientCharge * 100) / 100,
    afterFees: clientFees.netAmount,
    platformKeeps: clientFees.netAmount - (contractorEarned - payoutFees.platformFeeAmount),
  }
}
