# Power Automate Security Implementation Guide

## Overview

This guide outlines the implementation of API Key authentication for Power Automate flows to prevent unauthorized access. We're implementing this incrementally, starting with a pilot route and rolling out to all routes after successful testing.

## Security Architecture

### How It Works

1. **Next.js API Route** sends `x-pa-api-key` header when calling Power Automate
2. **Power Automate Flow** validates the header using a Condition action
3. **If valid**: Flow continues normally
4. **If invalid**: Flow returns 401 Unauthorized and terminates

### Why This Is Important

- Power Automate flow URLs are embedded in the Next.js app (not truly secret)
- Anyone who discovers the URL could potentially send malicious requests
- API key validation adds a critical security layer
- Prevents unauthorized data submission and potential abuse

## Implementation Status

### ✅ Completed

- [x] Generated secure `PA_API_KEY` (256-bit cryptographic random key)
- [x] Added `PA_API_KEY` to `.env.local` and `.env.example`
- [x] Updated documentation in `POWER_AUTOMATE_SIGNATURE_SETUP.md`

### 🔄 In Progress - Pilot Route

**Route:** `/api/assets` → PA_ASSETS_LIST_URL

**Status:** Code updated, awaiting Power Automate flow configuration and testing

**Why Assets Route:** GET request for data fetching, simple to test, used frequently by the app

**Next Steps:**

1. Configure Condition action in PA Signature flow (see below)
2. Test signature submission end-to-end
3. Verify 401 response with invalid/missing API key
4. Verify 200 success with valid API key

### ⏳ Pending Rollout

After successful pilot testing, implement security for these routes:

1. `/api/loans` → PA_LOANS_LIST_URL (Data fetching)
2. `/api/staff` → PA_STAFF_LIST_URL (Data fetching)
3. `/api/submit` → PA_FLOW_URL (Laptop request form)
4. `/api/signature` → PA_SIGNATURE_FLOW_URL
5. `/api/issue-laptop` → PA_ISSUE_LAPTOP_FLOW_URL
6. `/api/validate-loan` → PA_VALIDATE_LOAN_URL
7. `/api/update-asset-status` → PA_UPDATE_ASSET_STATUS_URL
8. `/api/update-to-loaned` → PA_UPDATE_TO_LOANED_URL
9. `/api/return-laptop` → PA_RETURN_LAPTOP_URL + PA_UPDATE_LOAN_STATUS_URL (2 flows)
10. `/api/auth/send-otp` → PA_SEND_OTP_URL (Public auth route)

**Total:** 11 routes, 12 Power Automate flows

## Power Automate Flow Configuration

### Step-by-Step: Adding API Key Validation

#### 1. Open Your Flow

Navigate to your Power Automate flow (e.g., Signature Flow)

#### 2. Add Condition Action

After the **"When a HTTP request is received"** trigger:

1. Click **"+ New step"**
2. Search for **"Condition"**
3. Add the **Condition** control action

#### 3. Configure Condition

**Left side (Choose a value):**

- Click in the field
- Select **"Dynamic content"** tab
- Find and click **"headers"** (under "When a HTTP request is received")
- Manually type `?['x-pa-api-key']` after `headers`
- Final expression: `headers?['x-pa-api-key']`

**Middle (Operator):**

- Select **"is equal to"**

**Right side (Choose a value):**

- Paste your PA_API_KEY value from `.env.local`
- Example: `uLPdeC6uILSQnfH8pRmfvtbzktK2V3kQiOSbWe+jb9k=`

#### 4. Configure "If yes" Branch (Valid API Key)

Move all your existing flow actions into this branch:

- SharePoint Create/Update Item
- Send Email
- Any other business logic
- Response (200 success)

#### 5. Configure "If no" Branch (Invalid API Key)

Add these actions:

**Response Action:**

- Status Code: `401`
- Headers: (leave empty)
- Body:
  ```json
  {
    "ok": false,
    "error": "Unauthorized - Invalid API key"
  }
  ```

**Terminate Action:**

- Status: **Failed**
- Error Code: `401`
- Error Message: `Unauthorized - Invalid API key`

#### 6. Save and Test

1. Save your flow
2. Test from the Next.js app
3. Verify successful submission
4. Test with invalid API key (temporarily change value in code)

## Testing Checklist - Pilot Route (Assets)

### Prerequisites

- [ ] PA_API_KEY added to `.env.local`
- [ ] Dev server restarted after env changes
- [ ] Power Automate Asset Manager flow updated with Condition
- [ ] Flow is turned ON

### Test Cases

#### Test 1: Valid API Key (Happy Path)

- [ ] Navigate to inventory page (http://localhost:3000/inventory)
- [ ] Page should load asset list from Power Automate
- [ ] **Expected:** Asset table displays with data
- [ ] **Expected:** No error messages
- [ ] **Expected:** Power Automate run history shows "Succeeded" (green checkmark)
- [ ] **Expected:** Network tab shows 200 response from /api/assets

#### Test 2: Invalid API Key (Security Test)

- [ ] Temporarily change PA_API_KEY in `.env.local` to wrong value
- [ ] Restart dev server
- [ ] Navigate to inventory page
- [ ] **Expected:** Error message or empty state displayed
- [ ] **Expected:** Network tab shows error from /api/assets
- [ ] **Expected:** Power Automate run history shows "Failed" (red X)
- [ ] **Expected:** Run details show it failed at Condition step

#### Test 3: Missing API Key (Security Test)

- [ ] Temporarily remove `'x-pa-api-key': process.env.PA_API_KEY || '',` from [app/api/assets/route.ts](app/api/assets/route.ts)
- [ ] Restart dev server
- [ ] Navigate to inventory page
- [ ] **Expected:** Error message or empty state displayed
- [ ] **Expected:** Power Automate run history shows "Failed"
- [ ] **Expected:** Network tab shows error from /api/assets

#### Test 4: Restore and Verify

- [ ] Restore correct PA_API_KEY in `.env.local`
- [ ] Restore x-pa-api-key header in [app/api/assets/route.ts](app/api/assets/route.ts) (if removed)
- [ ] Restart dev server
- [ ] Navigate to inventory page again
- [ ] **Expected:** Asset list loads successfully (confirming rollback works)

### Sign-Off

- [ ] All test cases passed
- [ ] No breaking changes observed
- [ ] Security validation working as expected
- [ ] Ready to roll out to remaining routes

**Tested by:** **\*\*\*\***\_\_\_**\*\*\*\***  
**Date:** **\*\*\*\***\_\_\_**\*\*\*\***  
**Approved for rollout:** [ ] Yes [ ] No

## Rollout Strategy

### Phase 1: Pilot (Current)

- **Route:** `/api/assets`
- **Method:** GET (data fetching)
- **Duration:** Test thoroughly before proceeding
- **Success Criteria:** All 4 test cases pass

### Phase 2: Data Fetching Routes

After pilot success, roll out to remaining data fetching routes:

1. `/api/loans`
2. `/api/staff`

### Phase 3: Form Submission Routes

After Phase 2 complete:

1. `/api/submit` (Laptop request)
2. `/api/signature`
3. `/api/issue-laptop`
4. `/api/validate-loan`
5. `/api/update-asset-status`
6. `/api/update-to-loaned`
7. `/api/return-laptop` (2 flows)

**Process for each route:**

1. Update route.ts to add `'x-pa-api-key'` header
2. Update corresponding Power Automate flow with Condition
3. Test with valid API key
4. Test with invalid API key
5. Verify success before moving to next route

### Phase 4: Auth Route

1. `/api/auth/send-otp`

**Note:** Auth route is public (no session required) but should still validate PA API key

## Code Pattern

### Next.js API Route

```typescript
const response = await fetch(flowUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-pa-api-key': process.env.PA_API_KEY || '',
  },
  body: JSON.stringify(data),
});
```

### Power Automate Flow

```
HTTP Trigger
    ↓
Condition: headers?['x-pa-api-key'] equals PA_API_KEY
    ↓
├─ If yes (Valid) ────→ [Your Business Logic] → Response (200)
│
└─ If no (Invalid) ───→ Response (401) → Terminate (Failed)
```

## Security Benefits

### Before Implementation

- ❌ Anyone with flow URL could send requests
- ❌ No way to validate request source
- ❌ Potential for abuse and malicious data injection
- ❌ No audit trail for unauthorized attempts

### After Implementation

- ✅ Only requests with valid API key are processed
- ✅ Unauthorized requests are logged in PA run history (Failed)
- ✅ Additional layer of defense beyond session authentication
- ✅ API key can be rotated without changing flow URLs

## API Key Rotation

If PA_API_KEY needs to be changed:

1. Generate new key:

   ```powershell
   $bytes = New-Object byte[] 32
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

2. Update `.env.local` with new key
3. Update all Power Automate Condition actions with new key
4. Restart dev server
5. Test all flows

**Recommended rotation schedule:** Every 90 days or immediately if compromised

## Troubleshooting

### Flow returns 401 "Unauthorized"

**Possible causes:**

- PA_API_KEY not set in `.env.local`
- Dev server not restarted after env change
- Typo in PA_API_KEY value
- Flow Condition configured incorrectly
- API key value doesn't match between .env and PA flow

**Solutions:**

1. Verify PA_API_KEY exists in `.env.local`
2. Restart dev server: Stop and start `npm run dev`
3. Double-check API key value matches exactly (no extra spaces)
4. Check PA flow Condition expression: `headers?['x-pa-api-key']`
5. Verify Condition operator is "is equal to"

### Flow runs but data not created

**Possible causes:**

- Flow actions placed in wrong branch (should be in "If yes")
- SharePoint permissions issue
- Data validation error

**Solutions:**

1. Verify all business logic is in "If yes" branch
2. Check PA run history for detailed error
3. Review SharePoint column mappings

### Can't access headers in Condition

**Solution:**

- Use Dynamic content → headers → manually type `?['x-pa-api-key']`
- Don't use Expression builder for header access
- The full text should be: `headers?['x-pa-api-key']`

## Reference Documentation

- Main API Security: [API_SECURITY.md](./API_SECURITY.md)
- **Asset Manager Flow Setup (Pilot Route):** [POWER_AUTOMATE_ASSET_MANAGER_SETUP.md](./POWER_AUTOMATE_ASSET_MANAGER_SETUP.md)
- Signature Flow Setup: [POWER_AUTOMATE_SIGNATURE_SETUP.md](./POWER_AUTOMATE_SIGNATURE_SETUP.md)
- Environment Variables: [.env.example](./.env.example)

## Environment Variables Required

```bash
# Power Automate API Key (added during this implementation)
PA_API_KEY=uLPdeC6uILSQnfH8pRmfvtbzktK2V3kQiOSbWe+jb9k=
```

**Important:** Keep this key secret. Never commit to git. Production should use a different key than development.
