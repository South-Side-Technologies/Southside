'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'
import InvoicePaymentButton from '@/app/components/dashboard/InvoicePaymentButton'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  date: string
  dueDate: string | null
  description?: string
  paidAt?: string | null
  project?: {
    id: string
    name: string
  }
  payments?: Array<{
    id: string
    amount: number
    status: string
    completedAt?: string
  }>
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'OVERDUE':
      return 'bg-red-100 text-red-800'
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creditBalance, setCreditBalance] = useState(0)
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch invoices
        const invoicesRes = await fetch('/api/dashboard/billing/invoices')
        if (!invoicesRes.ok) throw new Error('Failed to fetch invoices')
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)

        // Fetch credit balance
        try {
          const creditsRes = await fetch('/api/dashboard/billing/credits')
          if (creditsRes.ok) {
            const creditsData = await creditsRes.json()
            setCreditBalance(creditsData.currentBalance || 0)
          }
        } catch (err) {
          // Credits endpoint may not exist yet, that's ok
          console.log('Credits not available')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'PAID')
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
        <p className="text-gray-600">Manage and pay your invoices</p>
      </div>

      {/* Credit Balance Card */}
      {creditBalance > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Available Credits</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(creditBalance)}</p>
            </div>
            <Link
              href="/dashboard/billing/credits"
              className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
            >
              Manage Credits →
            </Link>
          </div>
        </div>
      )}

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Outstanding Invoices ({unpaidInvoices.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {unpaidInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() =>
                  setSelectedInvoice(
                    selectedInvoice === invoice.id ? null : invoice.id
                  )
                }
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {invoice.description || 'Invoice'}
                    </p>

                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Created: {formatDate(invoice.date)}</span>
                      {invoice.dueDate && (
                        <span>Due: {formatDate(invoice.dueDate)}</span>
                      )}
                      {invoice.project && (
                        <Link
                          href={`/dashboard/projects/${invoice.project.id}`}
                          className="text-red-600 hover:text-red-700"
                        >
                          Project: {invoice.project.name}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                </div>

                {/* Expanded payment section */}
                {selectedInvoice === invoice.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <InvoicePaymentButton
                      invoiceId={invoice.id}
                      amount={invoice.amount}
                      status={invoice.status}
                      invoiceNumber={invoice.invoiceNumber}
                      creditBalance={creditBalance}
                    />
                  </div>
                )}

                {selectedInvoice !== invoice.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedInvoice(invoice.id)
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Pay Invoice →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Invoices */}
      {paidInvoices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Paid Invoices ({paidInvoices.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {paidInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        PAID
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {invoice.description || 'Invoice'}
                    </p>

                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Created: {formatDate(invoice.date)}</span>
                      {invoice.paidAt && (
                        <span>Paid: {formatDate(invoice.paidAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices</h3>
          <p className="text-gray-600">
            You don't have any invoices yet. Contact support if you have questions.
          </p>
        </div>
      )}
    </div>
  )
}
