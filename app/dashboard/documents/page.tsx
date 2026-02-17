'use client'

import React, { useState, useEffect } from 'react'
import DocumentList, { type Document } from '../../components/dashboard/DocumentList'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchDocuments()
  }, [selectedCategory])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url =
        selectedCategory === 'all'
          ? '/api/dashboard/documents'
          : `/api/dashboard/documents?category=${selectedCategory}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (docId: string) => {
    try {
      const response = await fetch(`/api/dashboard/documents/download/${docId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to download file')
      }

      const data = await response.json()

      if (data.downloadUrl) {
        // Open Google Drive link in new tab
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      alert(error instanceof Error ? error.message : 'Failed to download file')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-playfair">
          Documents
        </h1>
        <p className="text-secondary text-lg">
          Access and download your contracts, invoices, and reports.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'btn-filter-active' : 'btn-filter-inactive'}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('contract')}
          className={selectedCategory === 'contract' ? 'btn-filter-active' : 'btn-filter-inactive'}
        >
          Contracts
        </button>
        <button
          onClick={() => setSelectedCategory('invoice')}
          className={selectedCategory === 'invoice' ? 'btn-filter-active' : 'btn-filter-inactive'}
        >
          Invoices
        </button>
        <button
          onClick={() => setSelectedCategory('report')}
          className={selectedCategory === 'report' ? 'btn-filter-active' : 'btn-filter-inactive'}
        >
          Reports
        </button>
        <button
          onClick={() => setSelectedCategory('documentation')}
          className={selectedCategory === 'documentation' ? 'btn-filter-active' : 'btn-filter-inactive'}
        >
          Documentation
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-secondary">Loading documents...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="alert-error text-center">
          <p className="font-semibold mb-2">Error Loading Documents</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchDocuments}
            className="btn-primary py-2 px-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && !error && (
        <DocumentList documents={documents} onDownload={handleDownload} />
      )}
    </div>
  )
}
