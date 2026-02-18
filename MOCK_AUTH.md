# Mock Authentication for Testing

To bypass real Google OAuth and use a mock test account for Playwright tests, use the mock authentication feature.

## Setup

The mock auth feature is configured in `.env.test`:

```
MOCK_AUTH_ENABLED=true
```

## How It Works

1. When `MOCK_AUTH_ENABLED=true` or when testing with `?testMode=true` query parameter, the login page displays a **🧪 Test Sign In** button
2. Clicking this button authenticates you as `test@example.com` without requiring Google OAuth
3. A test user is automatically created/updated in the database
4. Session is established and you're redirected to the dashboard

## Running Tests

### Option 1: With Mock Auth (Recommended for CI/Local Testing)

```bash
# Mock auth is enabled in .env.test by default
npx playwright test --headed
```

Or run the specific mock auth test:

```bash
npx playwright test tests/mock-auth.spec.ts --headed
```

### Option 2: With Real Google OAuth

Comment out or set to false in `.env.test`:

```
# MOCK_AUTH_ENABLED=false
```

Then run:

```bash
npx playwright test tests/main-flow.spec.ts --headed
```

## Environment Configuration

### Local Development
- Add `MOCK_AUTH_ENABLED=true` to `.env.local` to enable test sign-in button
- Useful for manual testing without Google OAuth

### Production Testing
- Mock auth is disabled by default on production (no environment variable set)
- Tests can still use it by passing `?testMode=true` query parameter
- The login page will automatically detect and enable the test button
- This is safe because the mock endpoint only creates test users

## API Endpoint

The mock auth endpoint is available at:

```
POST /api/auth/mock?testMode=true
```

Request body:
```json
{
  "email": "test@example.com",
  "name": "Test User"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "name": "Test User",
    "roles": ["CLIENT"]
  }
}
```

## Test User

Default test user:
- Email: `test@example.com`
- Name: `Test User`
- Role: `CLIENT` (or `ADMIN` if email matches ADMIN_EMAILS)

## Disabling Mock Auth in Production

To completely disable mock auth on production:

1. Remove or don't set `MOCK_AUTH_ENABLED` environment variable
2. Mock endpoint will reject all requests with 403 status
3. Tests must be run against a development environment with mock auth enabled

## Benefits

- ✅ No Google OAuth automation issues
- ✅ Fast, reliable authentication for tests
- ✅ Works in CI/CD pipelines
- ✅ No credential management needed
- ✅ Can be enabled/disabled per environment
