import { test, expect } from '@playwright/test'

test.describe('Mock Authentication - Test Mode', () => {
  test('should sign in with mock account and reach dashboard', async ({ page }) => {
    console.log('\n========== MOCK AUTH TEST ==========\n')

    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...')
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    console.log('✓ Login page loaded\n')

    // Step 2: Look for test sign-in button
    console.log('Step 2: Looking for test sign-in button...')
    const testButton = page.locator('button:has-text("Test Sign In")')
    const isTestButtonVisible = await testButton.isVisible().catch(() => false)

    if (!isTestButtonVisible) {
      console.log('✗ Test button not found')
      console.log('Make sure MOCK_AUTH_ENABLED=true is set in your environment')
      throw new Error('Mock auth button not available')
    }

    console.log('✓ Test sign-in button found\n')

    // Step 3: Click test sign-in button
    console.log('Step 3: Clicking test sign-in button...')
    await testButton.click()
    console.log('✓ Test button clicked\n')

    // Step 4: Wait for redirect to dashboard
    console.log('Step 4: Waiting for dashboard redirect...')
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    console.log('✓ Redirected to dashboard\n')

    // Step 5: Verify page loaded
    console.log('Step 5: Verifying page loaded...')
    const body = page.locator('body')
    await expect(body).toBeVisible()
    console.log('✓ Page loaded successfully\n')

    console.log('========== MOCK AUTH TEST PASSED ==========\n')
  })
})
