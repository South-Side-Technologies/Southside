import React from 'react'
import Link from 'next/link'

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#8B2E2E" />
    <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28C15.58 28 12 24.42 12 20Z" fill="white" />
    <circle cx="20" cy="20" r="4" fill="#8B2E2E" />
  </svg>
)

interface FooterProps {
  variant?: 'full' | 'minimal'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12 px-4 md:px-6 mt-8 md:mt-12">
      <div className="max-w-6xl mx-auto">
        {variant === 'full' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo />
                <h4 className="font-bold text-lg font-alfa">South Side Tech</h4>
              </div>
              <p className="text-gray-400 text-sm md:text-base">
                Enterprise technology solutions for forward-thinking businesses.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 font-playfair">Services</h4>
              <ul className="text-gray-400 space-y-2 text-sm md:text-base">
                <li>
                  <Link href="/services/cloud-infrastructure" className="hover:text-white transition-colors">
                    Cloud Infrastructure
                  </Link>
                </li>
                <li>
                  <Link href="/services/cost-optimization" className="hover:text-white transition-colors">
                    Cost Optimization
                  </Link>
                </li>
                <li>
                  <Link href="/services/ai-services" className="hover:text-white transition-colors">
                    AI Services
                  </Link>
                </li>
                <li>
                  <Link href="/services/web-development" className="hover:text-white transition-colors">
                    Web Development
                  </Link>
                </li>
                <li>
                  <Link href="/services/ci-cd-pipelines" className="hover:text-white transition-colors">
                    CI/CD Pipelines
                  </Link>
                </li>
                <li>
                  <Link href="/services/virtual-training" className="hover:text-white transition-colors">
                    Virtual Training Environments
                  </Link>
                </li>
                <li>
                  <Link href="/services/managed-deployment" className="hover:text-white transition-colors">
                    Deployment & Managed Services
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 font-playfair">Contact</h4>
              <p className="text-gray-400 text-sm md:text-base">Email: info@southsidetech.com</p>
              <p className="text-gray-400 text-sm md:text-base">Phone: (555) 123-4567</p>
            </div>
          </div>
        )}
        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center text-gray-400 text-sm md:text-base">
          <p>&copy; 2026 South Side Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
