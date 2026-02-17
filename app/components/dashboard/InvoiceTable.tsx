import React from 'react'

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  downloadUrl: string
}

interface InvoiceTableProps {
  invoices: Invoice[]
}

const statusColors = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
}

const statusLabels = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700 text-center">
        <p className="text-gray-400 text-lg">No invoices yet</p>
        <p className="text-gray-400 text-sm mt-2">Invoices will appear here when available</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
      {/* Mobile View - Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-sm text-gray-400 mb-1">{invoice.invoiceNumber}</p>
                <p className="text-lg font-bold text-white">{formatCurrency(invoice.amount)}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  statusColors[invoice.status]
                }`}
              >
                {statusLabels[invoice.status]}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{invoice.date}</p>
            <a
              href={invoice.downloadUrl}
              download
              className="inline-block text-sm text-red-700 hover:text-red-800 font-semibold"
            >
              Download PDF →
            </a>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Invoice #</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Date</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Amount</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Status</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-800 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-mono text-sm text-gray-900">{invoice.invoiceNumber}</span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-300">{invoice.date}</td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[invoice.status]
                    }`}
                  >
                    {statusLabels[invoice.status]}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <a
                    href={invoice.downloadUrl}
                    download
                    className="text-sm text-red-700 hover:text-red-800 font-semibold"
                  >
                    Download PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
