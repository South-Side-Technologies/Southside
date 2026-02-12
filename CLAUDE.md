# Southside Tech - Development Guidelines

## Communication Style
- **Keep responses minimal** - 3-5 sentences max unless detailed work needed
- Assume context is known unless clarifying is necessary
- Use concise code reviews and summaries

## Architecture Patterns

### Authentication & Authorization
- NextAuth with multi-role support: ADMIN, CONTRACTOR, CLIENT
- Roles stored in `roles` array on User model
- `middleware.ts` handles route protection with callbackUrl preservation
- Login page shows context-aware messaging based on destination portal

### Contractor Workflow
- Non-contractors access `/contractor` to start onboarding (no role check on layout)
- Application status: PENDING → APPROVED/REJECTED
- `/contractor/layout.tsx` shows sidebar only for users with CONTRACTOR role
- `/contractor/application-status` dedicated page for checking app status

### Database & Security
- Use Stripe for financial data (no SSN/Tax ID stored locally)
- Prisma ORM with proper indexes on common queries
- Activity logging for audit trails
- PII handling: delegate to third-party services

## Project Structure
- `app/` - Next.js app directory
- `app/api/` - API routes organized by domain (admin, contractor, dashboard)
- `app/lib/` - Utilities (auth, db, stripe, etc.)
- `prisma/schema.prisma` - Single source of truth for data model
- `middleware.ts` - Route protection and auth flow

## Recent Work
- Fixed redirect flow: users sent back to original destination after login
- Removed taxId field from contractor onboarding
- Added `/contractor/application-status` page
- Sidebar only shows for approved contractors

## Key Files
- `middleware.ts` - Authentication flow with callbackUrl
- `app/login/page.tsx` - Context-aware login UI
- `app/contractor/layout.tsx` - Layout without role enforcement
- `app/contractor/page.tsx` - Shows onboarding for non-contractors
- `app/contractor/application-status/page.tsx` - Status checking page

## Environment
- Next.js 14+ with App Router
- TypeScript strict mode
- Tailwind CSS for styling
- NextAuth v4+ with Google provider
- Prisma ORM with PostgreSQL/SQLite

---

# Payment System Implementation

## Status: 95% Complete - Ready for Production

### Database Models (7 new)
- `Payment` - Transaction log with fee tracking
- `Deposit` - Project deposits (paid, refunded, pending)
- `CreditBalance` - User retainer account with balance
- `CreditTransaction` - Credit movements (purchase, deduction, refund)
- `WebhookEvent` - Stripe webhook idempotency tracking
- `ContractorPayout` - Batch payouts with fee tracking
- Extensions to: User, Invoice, Subscription, Project, ActivityLog

### Key Features Implemented
**Client Payments:** Invoices, subscriptions, deposits, credit purchase/usage via Stripe Checkout
**Contractor Payouts:** Batch processing via Stripe Connect (Express) with fee calculation
**Fee Tracking:** Stripe fees calculated and stored (2.9% + $0.30 for client, 0.25% + $0.25 for contractor)
**Webhooks:** 10+ event handlers for checkout, invoice, subscription, transfer events

### Stripe Integration Files
- `app/lib/stripe/client.ts` - SDK initialization
- `app/lib/stripe/customers.ts` - Customer management
- `app/lib/stripe/checkout.ts` - Unified checkout creation
- `app/lib/stripe/subscriptions.ts` - Subscription lifecycle
- `app/lib/stripe/invoices.ts` - Invoice payments & credit application
- `app/lib/stripe/fees.ts` - Fee calculation utilities

### API Endpoints (18+)
**Client:** `/api/dashboard/billing/*` (invoices, subscription, deposits, credits, payments)
**Admin:** `/api/admin/invoices`, `/api/admin/payments/*`, `/api/admin/financial`
**Webhooks:** `/api/webhooks/stripe` (all Stripe events)

### UI Components
- `InvoicePaymentButton` - Smart button with card/credit toggle
- `SubscriptionManager` - Plan display, upgrade/downgrade/cancel
- `CreditBalanceCard` - Balance display, purchase modal
- `DepositPayment` - Deposit payment interface

### Testing with Different Roles
**Create test users:**
```sql
INSERT INTO users (email, name, role) VALUES
  ('admin@test.com', 'Admin', 'ADMIN'),
  ('contractor@test.com', 'Contractor', 'CONTRACTOR'),
  ('client@test.com', 'Client', 'CLIENT');
```

**Test Stripe cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

**Contractor test bank:** Routing `110000000`, Account `000123456789`

### Testing Endpoints
Run Stripe CLI webhook listener: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**End-to-end flows:**
1. Invoice payment (card)
2. Invoice payment (credits)
3. Subscription & recurring billing
4. Contractor onboarding & payout
5. Project deposit payment

### Security Checklist
- ✅ Webhook signatures verified
- ✅ API auth + role-based access control
- ✅ Input validation on all endpoints
- ✅ PCI compliance (no card data stored)
- ✅ Transaction atomicity for credit operations
- ⚠️ Rate limiting (not yet implemented)
- ⚠️ GDPR compliance (data deletion/export endpoints needed)

### Deployment
**Environment variables needed:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Database migration:**
```bash
npx prisma migrate dev --name add_payment_system
```

**Before production:**
- [ ] Rate limiting on checkout endpoints (10/hour per user)
- [ ] GDPR compliance features
- [ ] Monitoring/alerting configured
- [ ] Database backups verified
- [ ] Team trained on troubleshooting

### N8N Integration (Questionnaire)
Configure in `.env`:
```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n.com/webhook/questionnaire
N8N_WEBHOOK_AUTH=token-if-needed
```

Form data sent: companyName, contactName, email, phone, currentChallenges[], interestedServices[], budget, timeline, additionalInfo

### Common Patterns

### Protected Routes
```ts
// Layout: require auth only
const currentUser = await getCurrentUser()
if (!currentUser) redirect('/login')

// Page: implement role-specific logic (not layout)
const isApproved = currentUser.roles?.includes('CONTRACTOR')
```

### API Routes
- Verify auth: `getServerSession(authOptions)`
- Check roles: use `isAdmin()`, `isContractor()` helpers from `app/lib/auth/roles.ts`
- Return generic error messages (no info disclosure)
