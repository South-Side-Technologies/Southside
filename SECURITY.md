# Security & Compliance Guidelines

Comprehensive security and regulatory compliance documentation for Southside Tech.

## Table of Contents

- [PCI Compliance](#pci-compliance)
- [GDPR & Data Privacy](#gdpr--data-privacy)
- [Data Handling](#data-handling)
- [Webhook Security](#webhook-security)
- [Authentication & Authorization](#authentication--authorization)
- [Rate Limiting](#rate-limiting)
- [Encryption & Secrets](#encryption--secrets)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

---

## PCI Compliance

### Overview
The application handles payment processing through Stripe. **We store NO card data locally** - all credit card information is handled by Stripe.

### Current Status
- ✅ **PCI Level 1 Compliant** - Via Stripe (we delegate card handling)
- ✅ **No cardholder data stored** - Stripe Checkout/Elements handles all card info
- ✅ **No sensitive authentication data stored** - Stripe manages tokens
- ⚠️ **Tokenization required** - All card processing via Stripe Checkout or Stripe Elements

### Implementation Details

**Checkout Flow:**
```ts
// app/lib/stripe/checkout.ts
// Uses Stripe Checkout - hosted, PCI-compliant payment form
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  customer: customerId, // Stripe customer ID, not card data
  // Card data never touches our servers
})
```

**Never Do:**
- ❌ Store credit card numbers (full or partial)
- ❌ Store CVV codes
- ❌ Accept raw card data in API requests
- ❌ Log payment details to files/databases
- ❌ Store expiration dates without tokenization

### Audit Requirements
- Regular security scans for hardcoded card data
- Quarterly review of payment logs (no card numbers should appear)
- Annual PCI compliance certification via Stripe's attestation
- Monitor Stripe API deprecations

### Key Files
- `app/lib/stripe/checkout.ts` - Checkout session creation
- `app/lib/stripe/customers.ts` - Customer token management
- `app/api/webhooks/stripe` - Payment event handlers

---

## GDPR & Data Privacy

### Overview
GDPR applies if processing data of EU residents. Currently applicable to:
- Registered users from EU
- Contractors based in EU
- Any contact form submissions from EU

### Current Implementation Status
- ⚠️ **Partially Implemented**
- ❌ Data deletion endpoints needed
- ❌ Data export endpoints needed
- ⚠️ Privacy policy needs legal review
- ✅ Consent management in place (NextAuth)

### Required Features (Pre-Production)

#### 1. Data Subject Access Request (DSAR)
Users must be able to request their data within 30 days.

```ts
// app/api/gdpr/export - TODO: Implement
// Returns all user data in portable format
POST /api/gdpr/export
{
  "email": "user@example.com",
  "verificationCode": "..." // Verify identity
}

// Response: JSON/CSV export of:
// - Profile data
// - Project history
// - Payment/invoice records
// - Activity logs
// - Support tickets
```

#### 2. Right to Deletion ("Right to be Forgotten")
Users can request account deletion.

```ts
// app/api/gdpr/delete - TODO: Implement
POST /api/gdpr/delete
{
  "userId": "...",
  "reason": "User requested deletion"
}

// Deletes:
// - User profile
// - Personal data (name, email, phone)
// - Payment methods (via Stripe)
// - Activity logs (anonymized)
// - Support tickets (anonymized)

// Retains (legal/tax requirements):
// - Transaction records (anonymized)
// - Invoices (for tax purposes, PII removed)
// - Audit logs
```

#### 3. Consent Management
- ✅ Explicit consent on registration
- ✅ Cookie consent banner (if used)
- ✅ Marketing opt-in separate from account creation
- ⚠️ Need consent audit trail

#### 4. Data Processing Agreement (DPA)
Required if using subprocessors:
- ✅ Stripe (payments) - has Data Processing Addendum
- ✅ NextAuth (authentication)
- ✅ Vercel (hosting) - has DPA available

### Lawful Basis for Processing
- **Consent** - User registration, marketing emails
- **Contract** - Service agreement, payment processing
- **Legal obligation** - Tax records, compliance
- **Legitimate interest** - Analytics, fraud prevention

### Data Retention Policy

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| User account data | While active + 30 days after deletion | Service provision |
| Payment records | 7 years | Tax/legal compliance |
| Invoice data | 7 years | Tax records |
| Activity logs | 90 days | Security auditing |
| Marketing emails | Per consent | Marketing purposes |
| Support tickets | 2 years | Service improvement |
| Failed login attempts | 30 days | Security |

### Third-Party Integrations & DPAs
Verify all third-party services have signed Data Processing Addendums:
- [ ] Stripe - [DPA available](https://stripe.com/en-ie/privacy)
- [ ] Vercel - Request from support
- [ ] Database provider - Request from support

---

## Data Handling

### PII Classification

**Highly Sensitive (Encrypt, minimize storage):**
- Social Security Numbers (DO NOT STORE - use Stripe)
- Bank account numbers (stored by Stripe Connect only)
- Credit card numbers (DO NOT STORE - Stripe only)
- Tax ID numbers (DO NOT STORE - use Stripe)

**Sensitive (Encrypt at rest, audit access):**
- Email addresses
- Phone numbers
- Home addresses
- Payment method IDs (Stripe tokens)
- User authentication credentials

**Standard (Normal protection):**
- User name
- Company name
- Project descriptions
- Work history

### Database Security

**Sensitive Fields Encryption:**
```prisma
model User {
  // Encrypted at rest via database provider
  email       String      @unique
  phone       String?
  stripeId    String      // Stripe customer ID, safe to store

  // NEVER stored
  // ssn
  // taxId
  // cardNumber
  // cvv
}

model Payment {
  // Never store card details
  stripePaymentIntentId  String
  stripeFeeAmount        Decimal // Calculated by Stripe
  status                 PaymentStatus
  // NO: cardNumber, CVV, raw card data
}
```

**Access Controls:**
- Production database accessible only to:
  - Designated admins via encrypted VPN/bastion host
  - Application server via environment variable credentials
  - Never directly to developers locally
- Staging database can be used for development
- Test database with synthetic data for testing

### Logging & Monitoring

**What to Log:**
- ✅ API endpoint access (without sensitive data)
- ✅ Authentication attempts (success/failure)
- ✅ Permission changes
- ✅ Data modification events
- ✅ Administrative actions
- ✅ Stripe webhook events (no card data)

**What NOT to Log:**
- ❌ Full email addresses (log truncated version)
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ Stripe card tokens (log last 4 digits only if needed)
- ❌ API keys or secrets
- ❌ Session tokens

**Log Retention:**
```ts
// app/lib/activity-logging.ts
export async function logActivity(
  userId: string,
  type: ActivityType,
  metadata: Record<string, any>
) {
  // Sensitive fields are filtered before logging
  const sanitized = {
    ...metadata,
    email: undefined, // Don't log
    phone: undefined,
    ssn: undefined,
  }

  await prisma.activityLog.create({
    data: {
      userId,
      type,
      metadata: sanitized,
      createdAt: new Date(),
      // Auto-delete after 90 days
    }
  })
}
```

---

## Webhook Security

### Stripe Webhooks

**Signature Verification (CRITICAL):**
```ts
// app/api/webhooks/stripe.ts
import { Stripe } from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    // Always verify signature before processing
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return new Response(`Webhook Error: ${error}`, { status: 400 })
  }

  // Process verified event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle payment
      break
  }

  return new Response('OK', { status: 200 })
}
```

**Webhook Idempotency:**
```ts
// Prevent duplicate processing of same webhook
const existingEvent = await prisma.webhookEvent.findUnique({
  where: { stripeEventId: event.id }
})

if (existingEvent) {
  return new Response('Already processed', { status: 200 })
}

// Process and record
await processWebhookEvent(event)
await prisma.webhookEvent.create({
  data: {
    stripeEventId: event.id,
    type: event.type,
    data: event.data,
    processedAt: new Date(),
  }
})
```

**Events to Monitor:**
- ✅ `payment_intent.succeeded` - Successful payment
- ✅ `payment_intent.payment_failed` - Failed payment
- ✅ `charge.refunded` - Refund processed
- ✅ `invoice.payment_succeeded` - Subscription payment
- ✅ `customer.subscription.updated` - Plan change
- ✅ `account.updated` - Contractor onboarding status

**Webhook Secret Management:**
- Store in `STRIPE_WEBHOOK_SECRET` environment variable
- Rotate annually (Stripe allows multiple active signatures)
- Never commit to version control
- Log failed signature attempts

---

## Authentication & Authorization

### NextAuth Configuration

**Multi-Role Support:**
```ts
// app/lib/auth/roles.ts
export type UserRole = 'ADMIN' | 'CONTRACTOR' | 'CLIENT'

export function isAdmin(session?: Session): boolean {
  return session?.user?.roles?.includes('ADMIN') || false
}

export function isContractor(session?: Session): boolean {
  return session?.user?.roles?.includes('CONTRACTOR') || false
}

export function isClient(session?: Session): boolean {
  return session?.user?.roles?.includes('CLIENT') || false
}
```

**Protected Routes:**
```ts
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // Redirect unauthenticated users
  if (!session && isProtectedRoute(request.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based redirects
  if (session) {
    if (request.pathname.startsWith('/admin') && !isAdmin(session)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (request.pathname.startsWith('/contractor') && !isContractor(session)) {
      // Redirect to application if not approved
      return NextResponse.redirect(new URL('/contractor', request.url))
    }
  }

  return NextResponse.next()
}
```

**API Route Protection:**
```ts
// app/api/admin/payments/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  // Check authentication
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check authorization (admin only)
  if (!isAdmin(session)) {
    return new Response('Forbidden', { status: 403 })
  }

  // Process request
  const payments = await fetchPayments()
  return Response.json(payments)
}
```

**Session Security:**
- ✅ Secure HTTPS-only cookies
- ✅ CSRF protection via Next.js
- ✅ HttpOnly flag prevents JavaScript access
- ✅ SameSite=Strict for cookies
- ✅ Session expiration: 30 days (configurable)

### OAuth Providers

**Google OAuth Setup:**
- ✅ Verified client ID and secret in environment variables
- ✅ Authorized redirect URIs configured in Google Cloud Console
- ✅ Scope limitations (email, profile only)
- ✅ No sensitive scopes enabled

---

## Rate Limiting

### Current Status
- ❌ **Not yet implemented** - Needed before production

### Implementation Plan

**API Endpoints to Rate Limit:**
```ts
// app/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15m'), // 5 attempts per 15 minutes
  analytics: true,
})

export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1h'), // 10 checkouts per hour
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1m'), // 100 requests per minute
})
```

**Protected Endpoints:**
| Endpoint | Limit | Purpose |
|----------|-------|---------|
| POST /login | 5 per 15min | Prevent brute force |
| POST /api/checkout | 10 per hour | Prevent abuse |
| GET /api/invoices | 100 per min | General API protection |
| POST /api/admin/* | 50 per hour | Admin action protection |
| POST /api/webhooks/* | 1000 per min | Webhook tolerance |

### Implementation Before Production
- [ ] Deploy Upstash Redis or similar
- [ ] Add rate limit middleware
- [ ] Configure limits per endpoint
- [ ] Test with load testing tools
- [ ] Monitor for legitimate user impacts

---

## Encryption & Secrets

### Environment Variables

**Critical Secrets (Never commit):**
```bash
# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Authentication
NEXTAUTH_SECRET=<random-64-char-string>
NEXTAUTH_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Third-party Services
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# API Keys
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...
```

**Verification:**
```bash
# Ensure .env.local is in .gitignore
grep ".env.local" .gitignore
# Output: .env.local

# Check for accidentally committed secrets
git log -p | grep -i "sk_live_\|NEXTAUTH_SECRET"
```

### Data Encryption

**At Rest (Database):**
- PostgreSQL with SSL connections
- Application-level encryption for highly sensitive fields
- Encrypted backups with separate key management

**In Transit (Network):**
- ✅ HTTPS enforced (no HTTP)
- ✅ TLS 1.2+ required
- ✅ HSTS headers enabled
- ✅ Certificate pinning for Stripe API

**In Memory:**
- Avoid storing secrets in memory longer than needed
- Scrub sensitive data after processing
- Use secure string handling in TypeScript

### Secret Rotation

**Stripe Keys:**
```bash
# 1. Generate new webhook endpoint in Stripe Dashboard
# 2. Update STRIPE_WEBHOOK_SECRET in production env vars
# 3. Keep old key active for 24 hours (webhook grace period)
# 4. Test new key with test webhook
# 5. Remove old key after verification
```

**NextAuth Secret:**
```bash
# Generate new secret (OpenSSL)
openssl rand -base64 32

# Update NEXTAUTH_SECRET in production
# All existing sessions invalidated (users re-login)
# Schedule for low-traffic period
```

**Database Password Rotation:**
- Quarterly rotation recommended
- Update DATABASE_URL in env vars
- Verify application connectivity before removing old password

---

## Security Checklist

### Pre-Deployment

- [ ] **Authentication**
  - [ ] NextAuth secrets configured (non-default)
  - [ ] OAuth providers verified (client ID/secret)
  - [ ] Session expiration set (30 days)
  - [ ] Redirect URLs match production domain

- [ ] **Payment Security**
  - [ ] No card data in codebase (grep for /\d{13,19}/)
  - [ ] Stripe webhook secret configured
  - [ ] Webhook endpoints returning 200 OK
  - [ ] Payment amounts validated > 0
  - [ ] Stripe fee calculation verified

- [ ] **Database**
  - [ ] DATABASE_URL points to production (NOT test)
  - [ ] Migrations applied (`npx prisma migrate deploy`)
  - [ ] Backup strategy configured
  - [ ] SSL connections enforced
  - [ ] Database user has minimal required permissions

- [ ] **Secrets & Env Vars**
  - [ ] No secrets in .env file (only .env.local/.env.production)
  - [ ] All required env vars set (no defaults)
  - [ ] Secrets rotated within last 90 days
  - [ ] NEXTAUTH_SECRET is strong (32+ chars)
  - [ ] No test/dev keys in production

- [ ] **API Security**
  - [ ] Rate limiting deployed
  - [ ] Input validation on all endpoints
  - [ ] SQL injection prevention (Prisma parameterized queries)
  - [ ] CORS properly configured
  - [ ] CSRF tokens validated
  - [ ] API keys require authentication

- [ ] **Logging & Monitoring**
  - [ ] No sensitive data in logs
  - [ ] Log retention policy enforced (90 days)
  - [ ] Error messages don't reveal internals
  - [ ] Monitoring/alerting configured
  - [ ] Failed payment attempts logged

- [ ] **HTTPS & TLS**
  - [ ] HTTPS enforced (redirect HTTP → HTTPS)
  - [ ] HSTS header set (max-age=31536000)
  - [ ] Certificate valid and not self-signed
  - [ ] TLS 1.2+ minimum
  - [ ] No mixed content warnings

- [ ] **Compliance**
  - [ ] GDPR endpoints implemented (export/delete)
  - [ ] Privacy policy reviewed by legal
  - [ ] Terms of Service updated
  - [ ] Data retention policy documented
  - [ ] DPAs signed with all subprocessors

### Ongoing (Monthly)

- [ ] Review access logs for suspicious activity
- [ ] Check Stripe dashboard for failed payments/refunds
- [ ] Verify database backups completing
- [ ] Review activity logs for unauthorized changes
- [ ] Check for security advisories in dependencies
- [ ] Validate rate limiting is functioning

### Quarterly

- [ ] Rotate secrets (Stripe keys, database password)
- [ ] Review user access & permissions
- [ ] Audit third-party integrations
- [ ] Security dependency scanning
- [ ] Review GDPR compliance posture
- [ ] Backup restoration test

### Annually

- [ ] Full security audit
- [ ] Penetration testing (if budget allows)
- [ ] PCI compliance certification
- [ ] Privacy policy review & update
- [ ] Disaster recovery plan test

---

## Incident Response

### Security Incident Definition

**Critical:**
- Unauthorized access to production database
- Payment data exposed
- Production server compromised
- DDoS attack
- Ransomware/malware

**High:**
- Authentication bypass
- Privilege escalation
- Data breach (non-payment)
- Webhook tampering

**Medium:**
- Rate limiting bypass
- Unauthorized API access (limited scope)
- Configuration error exposing data

### Response Procedure

#### 1. Detect & Alert (0-15 minutes)
```
- Monitor receives alert
- On-call engineer notified
- Assess severity level
- Open incident ticket
```

#### 2. Contain (15-60 minutes)
**For database breach:**
```bash
# Stop application deployment pipeline
# Disable affected user accounts (if compromised)
# Revoke API keys if leaked
# Block suspicious IP addresses
# Enable enhanced logging
```

**For payment compromise:**
```bash
# Contact Stripe immediately
# Revoke Stripe API keys
# Generate new keys
# Notify affected customers
```

#### 3. Investigate (1-24 hours)
```
- Collect logs (application, database, infrastructure)
- Determine scope (how many records/users affected?)
- Identify root cause
- Check for lateral movement
- Review change logs for suspicious changes
```

#### 4. Eradicate (1-3 days)
```
- Patch vulnerability
- Rotate all compromised secrets
- Rebuild affected systems if needed
- Apply security updates
- Test fixes thoroughly
```

#### 5. Recover (ongoing)
```
- Restore from clean backups
- Gradually restore service
- Monitor for re-infection
- Implement permanent fix
```

#### 6. Communicate (throughout)
**Internal:**
- Daily status updates to stakeholders
- Engineering team briefings
- Management escalation if major

**External:**
- Customer notification (if PII exposed)
- Payment processor notification (Stripe)
- Regulatory notification (if GDPR/legal required)
- Public statement (if large-scale incident)

### Contacts

| Role | Contact | Responsibility |
|------|---------|-----------------|
| On-Call Engineer | [Slack] | Initial response |
| Engineering Lead | [Email] | Technical decisions |
| Security Officer | [Email] | Compliance/legal |
| Stripe Support | [Stripe dashboard] | Payment incidents |
| Hosting Provider | [Vercel support] | Infrastructure |

### Post-Incident

- [ ] Root cause analysis document
- [ ] Timeline of events
- [ ] What went wrong
- [ ] What we'll do differently
- [ ] Process improvements
- [ ] Share learnings with team

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [GDPR Official](https://gdpr-info.eu/)
- [Stripe Security](https://stripe.com/docs/security)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/example)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Support & Questions

For security concerns or questions:
1. Review this document first
2. Check CLAUDE.md for architecture context
3. Consult with security officer
4. Never discuss security details in public channels

Last Updated: 2026-02-17
