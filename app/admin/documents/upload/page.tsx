'use client'

import React, { useState } from 'react'

export default function AdminDocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [category, setCategory] = useState('CONTRACT')
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    // Clear previous messages when a new file is selected
    if (selectedFile) {
      setMessage('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !customerEmail) {
      setMessage('Please select a file and enter customer email')
      setMessageType('error')
      return
    }

    setIsUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('customerEmail', customerEmail)
      formData.append('category', category)

      const response = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed')
      }

      setMessage(data.message || `Successfully uploaded ${data.document.name}`)
      setMessageType('success')

      // Reset form
      setFile(null)
      setCustomerEmail('')
      setCategory('CONTRACT')

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload document')
      setMessageType('error')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 font-playfair">
            Upload Customer Document
          </h1>
          <p className="text-gray-600">
            Upload documents to Google Drive for your customers
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Email */}
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                placeholder="customer@example.com"
                required
                disabled={isUploading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Email must match an existing customer in the database
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Document Category <span className="text-red-600">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                disabled={isUploading}
              >
                <option value="CONTRACT">Contract</option>
                <option value="INVOICE">Invoice</option>
                <option value="REPORT">Report</option>
                <option value="DOCUMENTATION">Documentation</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="file" className="block text-sm font-semibold text-gray-700 mb-2">
                Select File <span className="text-red-600">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-red-700 transition-colors">
                <div className="space-y-2 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file"
                      className="relative cursor-pointer bg-white rounded-md font-semibold text-red-700 hover:text-red-800 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        required
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX up to 50MB
                  </p>
                </div>
              </div>

              {/* Selected File Info */}
              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-8 w-8 text-red-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                        if (fileInput) {
                          fileInput.value = ''
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                      disabled={isUploading}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !file || !customerEmail}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Document</span>
              )}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  messageType === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {messageType === 'success' ? (
                    <svg
                      className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Setup Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Make sure the customer exists in the database with a valid email</li>
            <li>Files will be organized in Google Drive by customer email</li>
            <li>Customers can view and download their documents from the dashboard</li>
            <li>Maximum file size is 50MB</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
