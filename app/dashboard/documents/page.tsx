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
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 font-playfair">
          Documents
        </h1>
        <p className="text-gray-600 text-lg">
          Access and download your contracts, invoices, and reports.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedCategory === 'all'
              ? 'bg-red-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('contract')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedCategory === 'contract'
              ? 'bg-red-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Contracts
        </button>
        <button
          onClick={() => setSelectedCategory('invoice')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedCategory === 'invoice'
              ? 'bg-red-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setSelectedCategory('report')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedCategory === 'report'
              ? 'bg-red-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setSelectedCategory('documentation')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedCategory === 'documentation'
              ? 'bg-red-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Documentation
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">Error Loading Documents</p>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDocuments}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
