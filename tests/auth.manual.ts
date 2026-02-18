import { test as setup } from '@playwright/test'

setup('manual authentication - complete login in browser', async ({ page, context }, testInfo) => {
  // Increase timeout for manual authentication
  testInfo.setTimeout(10 * 60 * 1000) // 10 minutes
  console.log('\n========== MANUAL AUTHENTICATION SETUP ==========')
  console.log('A browser window will open. Please complete the login manually.\n')
  console.log('Steps:')
  console.log('1. Navigate to the login page')
  console.log('2. Click "Sign in with Google"')
  console.log('3. Enter your email and password on Google\'s login form')
  console.log('4. Complete any security challenges (if any)')
  console.log('5. You will be redirected back to the app - this saves the auth state\n')
  console.log('=================================================\n')

  // Navigate to login page
  await page.goto('/login')

  // Wait for user to complete login manually
  // The page will navigate to /dashboard or similar once logged in
  try {
    await page.waitForURL('**/dashboard', { timeout: 5 * 60 * 1000 }) // 5 minute timeout
    console.log('✓ Login completed! Redirected to dashboard\n')
  } catch (e) {
    console.log('⚠ Did not complete login within timeout')
    console.log('Please ensure you completed the Google OAuth flow\n')
  }

  // Save the authentication state
  console.log('Saving authentication state...')
  await context.storageState({ path: 'tests/.auth/user.json' })
  console.log('✓ Auth state saved!\n')
  console.log('You can now run tests and they will use this saved session.\n')
  console.log('Run: npx playwright test dashboard.spec.ts --headed\n')
})
