'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FormData {
  fullName: string
  email: string
  companyName: string
  companyRegistration: string
  businessType: string
  phone: string
  website: string
  portfolio: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  bankAccountName: string
  bankRoutingNumber: string
  bankAccountNumber: string
  bankAccountType: string
  setupPaymentNow: boolean
  serviceCategories: string[]
  bio: string
}

const SERVICE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Project Management',
  'Business Consulting',
  'Data Analysis',
  'DevOps',
  'QA Testing',
  'Other',
]

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
]

const COUNTRIES = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Australia',
  'New Zealand',
  'Ireland',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'Czech Republic',
  'Austria',
  'Portugal',
  'Greece',
  'Turkey',
  'Russia',
  'Japan',
  'China',
  'India',
  'Singapore',
  'Hong Kong',
  'South Korea',
  'Thailand',
  'Malaysia',
  'Vietnam',
  'Philippines',
  'Indonesia',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'South Africa',
  'Nigeria',
  'Egypt',
  'Kenya',
  'Ghana',
  'Brazil',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Venezuela',
]

export default function ContractorOnboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<FormData>({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    companyName: '',
    companyRegistration: '',
    businessType: '',
    phone: '',
    website: '',
    portfolio: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    bankAccountName: '',
    bankRoutingNumber: '',
    bankAccountNumber: '',
    bankAccountType: 'checking',
    setupPaymentNow: false,
    serviceCategories: [],
    bio: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter((c) => c !== category)
        : [...prev.serviceCategories, category],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/contractor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit application')
        setLoading(false)
        return
      }

      setSubmitted(true)
      setTimeout(() => router.push('/contractor/application-status'), 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-8 text-center bg-gray-800 min-h-screen">Loading...</div>
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ✅ Application Submitted!
          </h2>
          <p className="text-green-700 mb-4">
            Thank you for applying! Your application is under review. In the meantime, you can set up your payment information.
          </p>
          <p className="text-sm text-green-600">Redirecting to application status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-gray-800">
      <div className="mb-8">
        <Link href="/contractor" className="text-blue-600 hover:underline">
          ← Back to Contractor
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2 text-gray-100">Contractor Onboarding</h1>
        <p className="text-gray-400">
          Complete your profile to become a contractor. An admin will review and approve
          your application.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled from account</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled from account</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
              >
                <option value="">Select...</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Agency">Agency</option>
                <option value="Corporation">Corporation</option>
                <option value="Partnership">Partnership</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Contact & Portfolio */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Contact & Portfolio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Portfolio URL
              </label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                placeholder="Link to your work samples"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Service Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.serviceCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Bio / About You
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                rows={4}
                placeholder="Tell us about your experience and expertise..."
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Address Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Address Line 1
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Address Line 2
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                >
                  <option value="">Select a state...</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                >
                  <option value="">Select a country...</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Setup (Optional) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Payment Setup (Optional)</h2>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="setupPaymentNow"
                checked={formData.setupPaymentNow}
                onChange={handleChange}
                className="mr-3"
              />
              <span className="text-sm font-medium text-gray-300">
                Set up payment account now (can also be done later)
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-2">
              We'll guide you through Stripe Connect setup for receiving payouts
            </p>
          </div>

          {formData.setupPaymentNow && (
            <div className="border-t border-gray-600 pt-6 space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Bank account information for direct deposits (optional, can add later)
              </p>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    name="bankRoutingNumber"
                    value={formData.bankRoutingNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Account Number
                  </label>
                  <input
                    type="password"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Account Type
                </label>
                <select
                  name="bankAccountType"
                  value={formData.bankAccountType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-900 text-gray-300"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-xs text-yellow-800">
                  🔒 Your bank information is encrypted and sent directly to Stripe.
                  We never store it on our servers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition min-h-[44px]"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 sm:flex-none px-6 py-3 border border-gray-600 rounded font-medium text-gray-300 hover:bg-gray-700 transition min-h-[44px]"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          By submitting this form, you agree to our contractor terms and conditions.
          Your information will be reviewed by an admin before approval.
        </p>
      </form>
    </div>
  )
}
