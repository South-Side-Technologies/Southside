'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Questionnaire() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    companySize: '',
    interestedServices: [] as string[],
    automationTechnologies: [] as string[],
    otherTechnology: '',
    budget: '',
    timeline: '',
    additionalInfo: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  // Fetch existing user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const data = await response.json()
          const user = data.user

          // Pre-fill form fields with existing user data
          setFormData((prev) => ({
            ...prev,
            companyName: user.companyName || '',
            contactName: user.name || '',
            email: user.email || '',
          }))
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        // Continue with empty form if fetch fails
      } finally {
        setIsLoadingUserData(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'interestedServices' | 'automationTechnologies') => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/submit-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitted(true)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err) {
      setError('Failed to submit the questionnaire. Please try again.')
      console.error('Form submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Header variant="public" subtitle="Consultation Submitted" />

        <main className="flex-grow flex items-center justify-center px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center w-full">
            <div className="bg-gray-800 rounded-lg p-6 md:p-12 shadow-md">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-playfair">Thank You!</h2>
              <p className="text-gray-300 mb-6 text-sm md:text-base">
                Your questionnaire has been submitted successfully. We'll review your information and get back to you shortly with tailored solutions for your business.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Redirecting you to your dashboard...
              </p>
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent"></div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (isLoadingUserData) {
    return (
      <>
        <Header variant="public" subtitle="Client Questionnaire" />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
            <p className="text-gray-400">Loading your information...</p>
          </div>
        </main>
        <Footer variant="minimal" />
      </>
    )
  }

  return (
    <>
      <Header variant="public" subtitle="Client Questionnaire" />

      <main className="flex-grow">
        <section className="py-8 md:py-16 px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 font-playfair">Let's Understand Your Needs</h2>

            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm md:text-base">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 md:p-8 shadow-md space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-white font-playfair">Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                    placeholder="Your company name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Size *</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              {/* Interested Services */}
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-white font-playfair">Which services interest you?</h3>
                <div className="space-y-3">
                  {[
                    'Cloud Infrastructure Management',
                    'Cloud Cost Optimization',
                    'Business Process Automation',
                    'AI Services',
                    'Web Development',
                    'Web Hosting',
                    'Security Engineering & Zero Trust',
                    'CI/CD Pipelines',
                    'Virtual Training Environments',
                    'Deployment & Managed Services',
                  ].map(service => (
                    <label key={service} className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        value={service}
                        checked={formData.interestedServices.includes(service)}
                        onChange={(e) => handleCheckboxChange(e, 'interestedServices')}
                        className="w-5 h-5 text-blue-500 rounded mt-1"
                      />
                      <span className="ml-3 text-gray-300 text-sm md:text-base">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Automation Technologies */}
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-white font-playfair">What technologies could we help you automate?</h3>
                <p className="text-gray-400 text-sm md:text-base mb-3">Select any software or systems you currently use that could benefit from automation</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                  {[
                    'Airtable',
                    'Asana',
                    'AWS',
                    'Azure',
                    'Discord',
                    'Dropbox',
                    'Email (Gmail/Outlook)',
                    'Excel',
                    'Google Ads',
                    'Google Drive',
                    'Google Sheets',
                    'HubSpot',
                    'Instagram',
                    'Jira',
                    'Mailchimp',
                    'Microsoft Teams',
                    'Monday.com',
                    'Notion',
                    'PayPal',
                    'QuickBooks',
                    'Salesforce',
                    'Shopify',
                    'Slack',
                    'Square',
                    'Stripe',
                    'Trello',
                    'Twilio',
                    'Webflow',
                    'WooCommerce',
                    'WordPress',
                    'Zapier',
                    'Custom APIs',
                    'Other',
                  ].map(tech => (
                    <label key={tech} className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        value={tech}
                        checked={formData.automationTechnologies.includes(tech)}
                        onChange={(e) => handleCheckboxChange(e, 'automationTechnologies')}
                        className="w-5 h-5 text-blue-500 rounded mt-1"
                      />
                      <span className="ml-3 text-gray-300 text-sm md:text-base">{tech}</span>
                    </label>
                  ))}
                </div>
                {formData.automationTechnologies.includes('Other') && (
                  <div className="mt-3 pl-8">
                    <input
                      type="text"
                      name="otherTechnology"
                      value={formData.otherTechnology}
                      onChange={handleInputChange}
                      placeholder="Please describe the technology..."
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                    />
                  </div>
                )}
              </div>

              {/* Budget and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range *</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                  >
                    <option value="">Select budget range</option>
                    <option value="<$10k">Less than $10,000</option>
                    <option value="$10k-$25k">$10,000 - $25,000</option>
                    <option value="$25k-$50k">$25,000 - $50,000</option>
                    <option value="$50k-$100k">$50,000 - $100,000</option>
                    <option value=">$100k">More than $100,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeline *</label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                  >
                    <option value="">Select timeline</option>
                    <option value="ASAP">ASAP</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-base"
                  placeholder="Tell us more about your project or requirements..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg transition-colors text-base md:text-lg min-h-12"
                >
                  {loading ? 'Submitting...' : 'Submit Questionnaire'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer variant="minimal" />
    </>
  )
}
