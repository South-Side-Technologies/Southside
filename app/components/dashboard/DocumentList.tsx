import React from 'react'

export interface Document {
  id: string
  name: string
  type: string // 'pdf', 'docx', 'xlsx', etc.
  size: number // bytes
  category: 'contract' | 'invoice' | 'report' | 'documentation'
  uploadedAt: string
  downloadUrl: string
}

interface DocumentListProps {
  documents: Document[]
  onDownload?: (docId: string) => void
}

const categoryColors = {
  contract: 'bg-purple-100 text-purple-700',
  invoice: 'bg-green-100 text-green-700',
  report: 'bg-blue-100 text-blue-700',
  documentation: 'bg-gray-800 text-gray-300',
}

const categoryLabels = {
  contract: 'Contract',
  invoice: 'Invoice',
  report: 'Report',
  documentation: 'Documentation',
}

// File type icons
const FileIcon = ({ type }: { type: string }) => {
  const iconType = type.toLowerCase()

  if (iconType === 'pdf') {
    return <span className="text-2xl">📄</span>
  }
  if (iconType === 'docx' || iconType === 'doc') {
    return <span className="text-2xl">📝</span>
  }
  if (iconType === 'xlsx' || iconType === 'xls') {
    return <span className="text-2xl">📊</span>
  }
  if (iconType === 'pptx' || iconType === 'ppt') {
    return <span className="text-2xl">📈</span>
  }
  if (iconType === 'zip' || iconType === 'rar') {
    return <span className="text-2xl">📦</span>
  }
  return <span className="text-2xl">📎</span>
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentList({ documents, onDownload }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700 text-center">
        <p className="text-gray-400 text-lg">No documents yet</p>
        <p className="text-gray-400 text-sm mt-2">Documents will appear here when available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-700 hover:shadow-md transition-shadow"
        >
          {/* File Icon and Name */}
          <div className="flex items-start gap-3 mb-3">
            <FileIcon type={doc.type} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate" title={doc.name}>
                {doc.name}
              </h3>
              <p className="text-xs text-gray-400 uppercase">{doc.type}</p>
            </div>
          </div>

          {/* Category Badge */}
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3 ${
              categoryColors[doc.category]
            }`}
          >
            {categoryLabels[doc.category]}
          </span>

          {/* Details */}
          <div className="space-y-1 text-xs text-gray-400 mb-4">
            <div>
              <span className="font-medium">Size:</span> {formatFileSize(doc.size)}
            </div>
            <div>
              <span className="font-medium">Uploaded:</span> {doc.uploadedAt}
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={() => onDownload?.(doc.id)}
            className="block w-full bg-red-700 hover:bg-red-800 text-white text-center font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Download
          </button>
        </div>
      ))}
    </div>
  )
}
