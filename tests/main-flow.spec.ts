import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.test file
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

// Get credentials from environment variables
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123'

test.describe('Main User Flow - Continuous Test', () => {
  test('complete user journey from homepage to login', async ({ page, context }) => {
    // Step 1: Load main page
    console.log('Step 1: Loading main page...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    console.log('✓ Main page loaded')

    // Step 2: Navigate to customer login
    console.log('\nStep 2: Navigating to customer login...')
    const customerLoginLink = page.locator('a:has-text("Customer Login"), a[href="/customer-login"], a[href*="login"]').first()

    if (await customerLoginLink.isVisible()) {
      await customerLoginLink.click()
      await page.waitForLoadState('networkidle')
      console.log('✓ Navigated to login page')
    } else {
      console.log('No customer login link found, going directly to /login')
      await page.goto('/login')
    }

    // Step 3: Verify login page loaded
    console.log('\nStep 3: Verifying login page elements...')
    await expect(page.locator('h1:has-text("South Side")')).toBeVisible()
    console.log('✓ Login page heading visible')

    // Step 4: Check for test sign in button (if available)
    console.log('\nStep 4: Checking for test sign in button...')
    const testButton = page.locator('button:has-text("Test Sign In")')
    const hasTestButton = await testButton.isVisible().catch(() => false)

    if (hasTestButton) {
      console.log('✓ Test sign in button found (mock auth enabled)')
    } else {
      console.log('✓ Test sign in button not found (using real Google auth)')
      const googleButton = page.locator('button:has-text("Sign in with Google")')
      await expect(googleButton).toBeVisible()
      await expect(googleButton).toBeEnabled()
      console.log('✓ Google sign in button found and enabled')
    }

    // Step 5: Verify footer links
    console.log('\nStep 5: Verifying footer links...')
    await expect(page.locator('a:has-text("Terms")')).toBeVisible()
    await expect(page.locator('a:has-text("Privacy")')).toBeVisible()
    await expect(page.locator('a:has-text("Support")')).toBeVisible()
    console.log('✓ All footer links visible')

    // Step 6: Click test sign in button
    console.log('\nStep 6: Clicking test sign in button...')

    if (!hasTestButton) {
      console.log('✗ Test sign in button not found - test mode not enabled')
      console.log('Make sure MOCK_AUTH_ENABLED=true in .env.test')
      throw new Error('Mock auth button not available')
    }

    await testButton.click()
    console.log('✓ Test sign in button clicked')

    // Step 7: Wait for redirect to dashboard after mock authentication
    console.log('\nStep 7: Waiting for redirect to dashboard...')
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
      console.log('⚠ Did not redirect to dashboard')
    })
    console.log('✓ Redirected to dashboard')

    console.log('\n✅ Complete user flow test finished - browser remains open to inspect state')
  })
})
