'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface FinancialData {
  totalRevenue: number
  totalPayouts: number
  netProfit: number
  pendingRevenue: number
  pendingPayouts: number
  projectCount: number
  activeContractors: number
  averageProjectValue: number
  byProject: Array<{
    id: string
    name: string
    revenue: number
    costs: number
    profit: number
  }>
}

function calculateMetrics(
  invoices: any[],
  subscriptions: any[],
  deposits: any[],
  payouts: any[],
  projectAssignments: any[]
): FinancialData {
  // Calculate revenue from invoices
  const invoiceRevenue = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const subscriptionRevenue = subscriptions
    .filter((sub) => sub.status === 'ACTIVE')
    .reduce((sum, sub) => sum + sub.amount, 0)

  const depositRevenue = deposits
    .filter((dep) => dep.status === 'PAID')
    .reduce((sum, dep) => sum + dep.amount, 0)

  const totalRevenue = invoiceRevenue + subscriptionRevenue + depositRevenue

  // Calculate pending revenue
  const pendingRevenue =
    invoices
      .filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + inv.amount, 0) +
    deposits
      .filter((dep) => dep.status === 'PENDING')
      .reduce((sum, dep) => sum + dep.amount, 0)

  // Calculate payouts
  const totalPayouts = payouts
    .filter((payout) => payout.status === 'COMPLETED')
    .reduce((sum, payout) => sum + payout.amount, 0)

  const pendingPayouts = payouts
    .filter((payout) => payout.status === 'PENDING' || payout.status === 'PROCESSING')
    .reduce((sum, payout) => sum + payout.amount, 0)

  return {
    totalRevenue,
    totalPayouts,
    netProfit: totalRevenue - totalPayouts,
    pendingRevenue,
    pendingPayouts,
    projectCount: projectAssignments.length,
    activeContractors: new Set(projectAssignments.map((pa) => pa.userId)).size,
    averageProjectValue: projectAssignments.length > 0
      ? (invoiceRevenue + depositRevenue) / projectAssignments.length
      : 0,
    byProject: [],
  }
}

export default function FinancialDashboardPage() {
  const [metrics, setMetrics] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all financial data
        const [invoicesRes, subRes, depositsRes, payoutsRes, assignmentsRes] =
          await Promise.all([
            fetch('/api/admin/invoices'),
            fetch('/api/dashboard/billing/subscription'),
            fetch('/api/dashboard/billing/deposits'),
            fetch('/api/admin/payments/pending'),
            fetch('/api/admin/projects'),
          ])

        const invoices = invoicesRes.ok ? await invoicesRes.json() : []
        const subscriptions = subRes.ok ? [await subRes.json()] : []
        const deposits = depositsRes.ok ? await depositsRes.json() : []
        const payoutsData = payoutsRes.ok ? await payoutsRes.json() : []
        const projectAssignments = assignmentsRes.ok
          ? (await assignmentsRes.json()).flatMap((p: any) => p.assignments || [])
          : []

        // Calculate metrics
        const calculated = calculateMetrics(
          invoices,
          subscriptions.filter((s): s is any => s && s.id),
          deposits,
          payoutsData.payouts || [],
          projectAssignments
        )

        setMetrics(calculated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load financial data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">Financial Overview</h1>
        <div className="card-light p-6 text-center">
          <div className="loading-spinner mb-4 mx-auto"></div>
          <p className="text-secondary">Loading financial data...</p>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">Financial Overview</h1>
        <div className="alert-error">
          {error || 'Failed to load data'}
        </div>
      </div>
    )
  }

  const marginPercent =
    metrics.totalRevenue > 0
      ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1)
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Financial Overview</h1>
        <p className="text-secondary">Platform revenue, contractor payouts, and profitability</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="stat-card">
          <p className="stat-label">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="stat-subtext">+{formatCurrency(metrics.pendingRevenue)} pending</p>
        </div>

        {/* Total Payouts */}
        <div className="stat-card">
          <p className="stat-label">Contractor Payouts</p>
          <p className="text-3xl font-bold text-orange-600 mb-2">
            {formatCurrency(metrics.totalPayouts)}
          </p>
          <p className="stat-subtext">+{formatCurrency(metrics.pendingPayouts)} pending</p>
        </div>

        {/* Net Profit */}
        <div className="stat-card">
          <p className="stat-label">Net Profit</p>
          <p className={`text-3xl font-bold mb-2 ${metrics.netProfit >= 0 ? 'text-blue-600 : 'text-red-400'}`}>
            {formatCurrency(metrics.netProfit)}
          </p>
          <p className="stat-subtext">{marginPercent}% margin</p>
        </div>

        {/* Active Projects */}
        <div className="stat-card">
          <p className="stat-label">Active Projects</p>
          <p className="text-3xl font-bold text-primary mb-2">
            {metrics.projectCount}
          </p>
          <p className="stat-subtext">{metrics.activeContractors} active contractors</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="card-light p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Revenue Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-secondary mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width:
                    metrics.totalRevenue > 0
                      ? `${Math.min(100, (metrics.totalRevenue / (metrics.totalRevenue + metrics.totalPayouts)) * 100)}%`
                      : '0%',
                }}
              ></div>
            </div>
          </div>

          <div>
            <p className="text-sm text-secondary mb-2">Contractor Costs</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.totalPayouts)}
            </p>
            <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width:
                    metrics.totalPayouts > 0
                      ? `${Math.min(100, (metrics.totalPayouts / (metrics.totalRevenue + metrics.totalPayouts)) * 100)}%`
                      : '0%',
                }}
              ></div>
            </div>
          </div>

          <div>
            <p className="text-sm text-secondary mb-2">Net Profit</p>
            <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600 : 'text-red-400'}`}>
              {formatCurrency(metrics.netProfit)}
            </p>
            <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metrics.netProfit >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}
                style={{
                  width:
                    metrics.netProfit > 0 && metrics.totalRevenue > 0
                      ? `${Math.min(100, (metrics.netProfit / metrics.totalRevenue) * 100)}%`
                      : '0%',
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/invoices">
          <div className="card-light p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Invoices & Revenue
            </h3>
            <p className="text-sm text-secondary mb-4">
              View and manage all client invoices and revenue tracking
            </p>
            <span className="text-red-400 hover:text-red-700:text-red-300 font-medium text-sm">
              Manage Invoices →
            </span>
          </div>
        </Link>

        <Link href="/admin/payments">
          <div className="card-light p-6 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Contractor Payouts
            </h3>
            <p className="text-sm text-secondary mb-4">
              Process and track batch payments to contractors
            </p>
            <span className="text-red-400 hover:text-red-700:text-red-300 font-medium text-sm">
              Manage Payouts →
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
