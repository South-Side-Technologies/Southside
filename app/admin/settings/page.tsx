'use client'

import React, { useState } from 'react'

export default function AdminSettingsPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInitializeFolders = async () => {
    if (!confirm('This will create default folders (Billing, Technical) for all users. Continue?')) {
      return
    }

    setIsInitializing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/init-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initialize folders')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize folders')
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 font-playfair">
          Admin Settings
        </h1>
        <p className="text-gray-600 text-lg">
          Platform configuration and maintenance
        </p>
      </div>

      {/* Folder Initialization Card */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Folder Management</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Initialize User Folders</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create default folders (Billing, Technical) for all users. This action is safe to run multiple times - existing folders won't be duplicated.
            </p>
          </div>

          <button
            onClick={handleInitializeFolders}
            disabled={isInitializing}
            className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {isInitializing ? 'Initializing...' : 'Initialize Folders for All Users'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">{result.message}</p>
              <p className="text-sm text-green-700 mb-4">
                Processed {result.totalUsersProcessed} users
              </p>

              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-green-900 mb-2">Results:</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-green-300">
                          <th className="text-left py-2 px-2">User</th>
                          <th className="text-left py-2 px-2">Folder</th>
                          <th className="text-left py-2 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((r: any, idx: number) => (
                          <tr key={idx} className="border-b border-green-200">
                            <td className="py-2 px-2 text-green-900">{r.user}</td>
                            <td className="py-2 px-2 text-green-900">{r.folder}</td>
                            <td className="py-2 px-2">
                              <span
                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                  r.status === 'created'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {r.status === 'created' ? 'Created' : 'Exists'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
