'use client'

import { useEffect, useState } from 'react'

export default function AuthDebugPage() {
  const [info, setInfo] = useState<any>(null)

  useEffect(() => {
    // Get the NextAuth configuration details from the environment
    setInfo({
      NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set',
      currentURL: typeof window !== 'undefined' ? window.location.href : 'N/A',
      expectedCallbackURL: 'https://southside.brandonslab.work/api/auth/callback/google',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    })
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Debug Information</h1>

      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Current Page URL:</h2>
          <code className="text-sm">{info?.currentURL}</code>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Expected Callback URL (in Google Cloud):</h2>
          <code className="text-sm">{info?.expectedCallbackURL}</code>
        </div>

        <div className="bg-blue-100 p-4 rounded border border-blue-300">
          <h2 className="font-bold mb-4">Checklist:</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ 1. Go to Google Cloud Console → APIs & Services → Credentials</li>
            <li>✓ 2. Click on your OAuth 2.0 Client ID</li>
            <li>✓ 3. Under "Authorized redirect URIs", verify this exact URL exists:</li>
            <li className="bg-gray-800 p-2 rounded font-mono text-xs">
              https://southside.brandonslab.work/api/auth/callback/google
            </li>
            <li>✓ 4. If missing, add it and click Save</li>
            <li>✓ 5. Wait 30 seconds for changes to propagate</li>
            <li>✓ 6. Come back and try signing in again</li>
          </ul>
        </div>

        <div className="bg-yellow-100 p-4 rounded border border-yellow-300">
          <h2 className="font-bold mb-2">Common Issues:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Trailing slash mismatch: `/google` vs `/google/`</li>
            <li>Protocol mismatch: `https://` vs `http://`</li>
            <li>Domain mismatch: Different subdomain or path</li>
            <li>Cloudflare Tunnel not forwarding OAuth callback properly</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
