# Contractor Payment Approval System - Testing Guide

## Setup

Before testing, ensure:
1. ✅ Database migrations applied (`npx prisma db push` - already done)
2. ✅ API endpoints deployed to `/api/admin/payments/assignments/*`
3. ✅ Admin UI rebuilt at `/admin/payments`
4. ✅ You have admin credentials to log in
5. ✅ Stripe Connect is set up for contractors

## Test Workflow

### Phase 1: Create Test Data

#### 1.1 Create a Contractor (if needed)
```bash
# Via database or UI - ensure contractor has:
# - roles: ['CONTRACTOR']
# - Stripe Connect account onboarded (stripeOnboardingComplete: true)
# - stripeConnectAccountId set
```

#### 1.2 Create a Project
```bash
# Via admin UI:
# 1. Go to /admin/projects
# 2. Click "Create Project"
# 3. Fill in:
#    - Name: "Test Project - Payment Approval"
#    - Description: "Testing payment approval workflow"
#    - Status: PLANNING
#    - Start Date: Today
# 4. Save project
```

#### 1.3 Assign Contractor to Project
```bash
# Option A: Via API
curl -X POST "http://localhost:3000/api/admin/projects/{projectId}/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "contractorId": "{contractorId}",
    "paymentAmount": 1500.00
  }'

# Option B: Via Database
psql
UPDATE project_assignments
SET payment_amount = 1500.00
WHERE project_id = '{projectId}' AND user_id = '{contractorId}';
```

---

### Phase 2: Trigger Pending Status

#### 2.1 Mark Project as Completed
This automatically updates assignments from UNPAID → PENDING

```bash
curl -X PATCH "http://localhost:3000/api/admin/projects/{projectId}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

#### 2.2 Verify Assignment is PENDING
```bash
curl -X GET "http://localhost:3000/api/admin/payments/pending" \
  -H "Authorization: Bearer {adminToken}"

# Should return assignment with:
# - paymentStatus: "PENDING"
# - approvedForPayment: null (not reviewed)
# - paymentAmount: 1500
```

---

### Phase 3: Test Review Endpoints

#### 3.1 Test Approve Endpoint
```bash
curl -X POST "http://localhost:3000/api/admin/payments/assignments/{assignmentId}/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewNotes": "Looks good, contractor did excellent work"
  }'

# Expected Response:
# {
#   "success": true,
#   "assignment": {
#     "approvedForPayment": true,
#     "approvedBy": "{adminId}",
#     "approvedAt": "2026-02-16T...",
#     "reviewNotes": "Looks good..."
#   }
# }
```

#### 3.2 Test Reject Endpoint
```bash
curl -X POST "http://localhost:3000/api/admin/payments/assignments/{assignmentId}/reject" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Hours don't match invoice",
    "reviewNotes": "Need contractor to submit corrected invoice"
  }'

# Expected Response:
# {
#   "success": true,
#   "assignment": {
#     "approvedForPayment": false,
#     "rejectionReason": "Hours don't match invoice",
#     "reviewNotes": "..."
#   }
# }
```

#### 3.3 Test Edit Amount Endpoint
```bash
curl -X PATCH "http://localhost:3000/api/admin/payments/assignments/{assignmentId}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentAmount": 1200.00,
    "reviewNotes": "Reduced rate per agreement"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Payment amount updated. Approval status has been reset for re-review.",
#   "assignment": {
#     "paymentAmount": 1200.00,
#     "approvedForPayment": null  # Reset!
#   }
# }
```

#### 3.4 Test Bulk Approve Endpoint
```bash
curl -X POST "http://localhost:3000/api/admin/payments/assignments/approve-batch" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentIds": ["{assignmentId1}", "{assignmentId2}", "{assignmentId3}"],
    "reviewNotes": "Approved in batch"
  }'

# Expected Response:
# {
#   "summary": {
#     "total": 3,
#     "successful": 3,
#     "failed": 0
#   },
#   "results": [...]
# }
```

---

### Phase 4: Test Admin UI

#### 4.1 Visit Review Tab
```
1. Go to http://localhost:3000/admin/payments
2. Should land on "Review Assignments" tab
3. Should see contractor group with assignment card showing:
   - Project name
   - Payment amount: $1500.00
   - Status badge: "Pending Review"
4. Approve/Reject/Edit buttons visible
```

#### 4.2 Test Approve via UI
```
1. Click "✓ Approve" button on assignment
2. Modal or inline approval should trigger
3. Optional: add review notes
4. Click "Approve"
5. Should see success message
6. Assignment should update to "✓ Approved" status
7. Status badge should change to green
```

#### 4.3 Test Reject via UI
```
1. Click "✗ Reject" button on assignment
2. Reject modal should appear with:
   - Required "Rejection Reason" field
   - Optional "Notes" field
3. Enter reason: "Quality issues"
4. Click "Reject"
5. Should see success message
6. Assignment should update to "✗ Rejected" status
7. Red badge with rejection reason visible
```

#### 4.4 Test Edit Amount via UI
```
1. Click "✎ Edit Amount" button
2. Edit modal should appear with:
   - Current amount field
   - Notes field
   - Warning: "Changing amount will reset approval status"
3. Change amount to: 1800.00
4. Click "Update Amount"
5. Assignment should revert to "Pending Review"
6. Amount should show 1800.00
```

#### 4.5 Test Filtering
```
1. Filter dropdown shows: "Not Reviewed", "Approved", "Rejected", "All"
2. Select "Not Reviewed" - see only unreviewed assignments
3. Select "Approved" - see only approved assignments
4. Select "Rejected" - see only rejected assignments
5. Select "All" - see all assignments
```

#### 4.6 Test Expandable Groups
```
1. Contractor groups should be collapsible/expandable
2. Click on contractor row to expand
3. Individual assignments should appear
4. Click again to collapse
5. Assignments should hide
```

---

### Phase 5: Test Process Payments Tab

#### 5.1 Navigate to Process Tab
```
1. Click "💳 Process Payments" tab
2. Should see different view with:
   - Summary cards updated
   - Table showing only contractors with APPROVED assignments
   - If no approved assignments: "No approved payments to process"
```

#### 5.2 Select Contractors
```
1. Check checkbox for contractor with approved assignments
2. "Selected Amount" card should update
3. Select multiple contractors
4. "Process Selected Payments" button should enable
```

#### 5.3 Test Batch Processing
```
1. Select one or more contractors with approved assignments
2. Click "Process Selected Payments"
3. Confirmation dialog: "Process payments for X contractor(s)?"
4. Confirm
5. Should see: "Successfully processed payments for X contractor(s)"
6. Stripe transfers should be initiated
7. ContractorPayout records created in database
```

---

### Phase 6: Test Edge Cases

#### 6.1 Project Status Reversion
```
1. Approve an assignment
2. Manually change project status back to IN_PROGRESS
3. Try to process batch payment
4. Should skip that assignment with error:
   "Project no longer completed"
```

#### 6.2 Unapproved Assignment in Batch
```
1. Have 2 assignments: one APPROVED, one PENDING (not reviewed)
2. Select the contractor for batch processing
3. Only the APPROVED assignment should be processed
4. PENDING should be skipped
```

#### 6.3 Contractor Without Stripe Onboarding
```
1. Approve assignment for contractor
2. Set contractor.stripeOnboardingComplete = false
3. Try to process batch payment
4. Should fail with: "Contractor has not completed onboarding"
```

#### 6.4 Invalid Payment Amount
```
1. Try to edit assignment to $0
2. Should show error: "Payment amount must be greater than 0"
3. Try to edit to negative number
4. Should show error
```

---

### Phase 7: Verify Activity Logs

#### 7.1 Check Database Activity Logs
```sql
-- View all assignment approval activities
SELECT * FROM activity_logs
WHERE type LIKE 'assignment_%'
ORDER BY created_at DESC
LIMIT 10;

-- Should see entries for:
-- - assignment_approved
-- - assignment_rejected
-- - assignment_payment_edited
```

#### 7.2 Verify Audit Trail
```sql
SELECT
  type,
  user_id,
  project_id,
  metadata,
  created_at
FROM activity_logs
WHERE project_id = '{projectId}'
ORDER BY created_at DESC;

-- Should show all approval decisions with:
-- - Admin who made decision (user_id)
-- - Timestamp (created_at)
-- - Details (metadata)
```

---

### Phase 8: Database Verification

#### 8.1 Check ProjectAssignment Fields
```sql
SELECT
  id,
  payment_amount,
  payment_status,
  approved_for_payment,
  approved_by,
  approved_at,
  rejection_reason,
  review_notes
FROM project_assignments
WHERE id = '{assignmentId}';
```

#### 8.2 Check ContractorPayout Created
```sql
SELECT
  id,
  contractor_id,
  batch_id,
  amount,
  stripe_fee_amount,
  net_amount,
  status,
  stripe_transfer_id
FROM contractor_payouts
ORDER BY created_at DESC
LIMIT 5;
```

---

## Success Criteria

- ✅ Assignments appear in Review tab with null approval status
- ✅ Can approve/reject individual assignments
- ✅ Can edit payment amounts (resets approval)
- ✅ Bulk approval works for multiple assignments
- ✅ Filter by status works correctly
- ✅ Only approved assignments appear in Process tab
- ✅ Batch processing creates Stripe transfers
- ✅ Activity logs created for all actions
- ✅ Edge cases handled gracefully
- ✅ Dark mode styling works

## Troubleshooting

### Assignments not appearing in Review tab
- Verify project is COMPLETED
- Check that assignment has paymentAmount > 0
- Verify user is ADMIN role
- Check database for assignment records

### Approve/Reject buttons not working
- Check browser console for errors
- Verify assignment ID is correct
- Check API endpoint is deployed
- Verify authentication token is valid

### Stripe transfer not created
- Verify contractor has stripeConnectAccountId
- Verify stripeOnboardingComplete = true
- Check Stripe test API keys configured
- Review Stripe dashboard for webhook events

### Activity logs not created
- Verify ActivityLog model in Prisma schema
- Check database migration completed
- Verify userId and projectId are valid

---

## Notes

- Test with Stripe test credentials
- Use test card: 4242 4242 4242 4242
- Use test bank: Routing 110000000, Account 000123456789
- All data is test data and can be deleted
