import { test as setup } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load credentials
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123'

// Single setup test that runs once and saves auth state
setup('authenticate and save state', async ({ page, context }) => {
  console.log('\n========== AUTHENTICATION SETUP ==========')
  console.log('Running authentication setup to save login state...\n')

  // Step 1: Go to login page
  console.log('Step 1: Navigating to login page...')
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  console.log('✓ Login page loaded\n')

  // Step 2: Click Google sign in button
  console.log('Step 2: Clicking Google sign in button...')
  const googleButton = page.locator('button:has-text("Sign in with Google")')
  await googleButton.click()
  console.log('✓ Google button clicked\n')

  // Step 3: Wait for Google redirect
  console.log('Step 3: Waiting for Google OAuth page...')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  console.log('✓ Google OAuth page loaded\n')

  // Step 4: Enter email
  console.log(`Step 4: Entering email: ${TEST_EMAIL}`)
  const emailInput = page.locator('input[type="email"], input#identifierId')
  if (await emailInput.isVisible()) {
    await emailInput.fill(TEST_EMAIL)
    await page.waitForTimeout(500)
    console.log('✓ Email entered\n')
  }

  // Step 5: Click Next
  console.log('Step 5: Clicking Next button...')
  const nextButton = page.locator('button:has-text("Next"), button[aria-label*="Next"]').first()
  if (await nextButton.isVisible()) {
    await nextButton.click()
    console.log('✓ Next button clicked\n')
    await page.waitForTimeout(3000)
  }

  // Step 6: Enter password
  console.log('Step 6: Entering password...')
  const passwordInput = page.locator('input[type="password"]')

  // Wait for password field
  let attempts = 0
  while (!(await passwordInput.isVisible()) && attempts < 10) {
    await page.waitForTimeout(1000)
    attempts++
  }

  if (await passwordInput.isVisible()) {
    await passwordInput.fill(TEST_PASSWORD)
    console.log('✓ Password entered\n')
    await page.waitForTimeout(500)

    // Step 7: Click Sign In
    console.log('Step 7: Clicking Sign In button...')
    const signInButton = page.locator('button:has-text("Next"), button:has-text("Sign in")').first()
    if (await signInButton.isVisible()) {
      await signInButton.click()
      console.log('✓ Sign In button clicked\n')
    }
  } else {
    console.log('⚠ Password field not found - Google may be blocking automated access')
    console.log('   Try: 1) Disabling 2FA on your test account')
    console.log('        2) Creating a new Google account for testing')
    console.log('        3) Checking Google Account Security Settings\n')
    throw new Error('Could not access password field on Google login')
  }

  // Step 8: Wait for redirect back to app
  console.log('Step 8: Waiting for redirect to dashboard...')
  await page.waitForURL('**/dashboard', { timeout: 30000 }).catch(() => {
    console.log('⚠ Did not redirect to dashboard - may need to complete Google security checks')
  })

  // Step 9: Save authentication state
  console.log('Step 9: Saving authentication state...')
  await context.storageState({ path: 'tests/.auth/user.json' })
  console.log('✓ Auth state saved to tests/.auth/user.json\n')

  console.log('========== AUTHENTICATION COMPLETE ==========\n')
})
