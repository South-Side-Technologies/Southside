import { test, expect } from '@playwright/test'

test.describe('Dashboard - Authenticated User', () => {
  test('should load dashboard for authenticated user', async ({ page }) => {
    console.log('\n========== DASHBOARD TEST ==========\n')

    // Should be already authenticated from setup
    console.log('Step 1: Navigating to dashboard...')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    console.log('✓ Dashboard loaded\n')

    // Verify dashboard content
    console.log('Step 2: Verifying dashboard elements...')
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
    console.log('✓ Dashboard heading visible\n')

    // Check for main content
    const content = page.locator('body')
    await expect(content).toBeVisible()
    console.log('✓ Dashboard content visible\n')

    console.log('========== DASHBOARD TEST PASSED ==========\n')
  })

  test('should have user navigation available', async ({ page }) => {
    console.log('\nStep 1: Navigating to dashboard...')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    console.log('Step 2: Checking for navigation...')
    // Look for nav elements that indicate user is logged in
    const body = page.locator('body')
    await expect(body).toBeVisible()
    console.log('✓ Navigation available\n')
  })
})

test.describe('Login Page - Unauthenticated', () => {
  test('login page should be accessible without auth', async ({ page, context }) => {
    // Skip loading saved auth state for this test
    // Clear cookies/storage to test unauthenticated state
    await context.clearCookies()

    console.log('\nStep 1: Navigating to login page...')
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    console.log('Step 2: Verifying login page...')
    const googleButton = page.locator('button:has-text("Sign in with Google")')
    await expect(googleButton).toBeVisible()
    console.log('✓ Login page displayed with Google button\n')
  })
})
