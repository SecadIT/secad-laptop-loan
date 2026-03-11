# Power Automate Validate Loan Flow Setup Guide

This guide explains how to set up the Power Automate flow to validate loan IDs before processing issue laptop or signature forms.

## Flow Purpose

This flow checks if a loan ID exists in your SharePoint Laptop Loans list. It's called before submitting issue laptop or signature forms to prevent errors with non-existent loan IDs.

## Flow Configuration

### 1. HTTP Trigger

Create a flow that starts with **"When a HTTP request is received"** trigger.

**Request Body JSON Schema:**

```json
{
  "type": "object",
  "properties": {
    "loanId": {
      "type": "string"
    }
  }
}
```

### 2. Get Items from SharePoint

Add **"Get items"** action:

- **Site Address:** Your SharePoint site
- **List Name:** Laptop Loans (or your loan list name)
- **Filter Query:** `ID eq @{triggerBody()?['loanId']}`
- **Top Count:** 1

This queries for a loan with the matching ID.

### 3. Condition - Check if Loan Found

Add a **"Condition"** action:

- **Condition:** `length(body('Get_items')?['value'])` is greater than `0`

This checks if any items were returned.

### 4A. If Yes - Loan Found

In the **If yes** branch, add a **"Response"** action:

- **Status Code:** 200
- **Body:**
  ```json
  {
    "ok": true,
    "exists": true,
    "loan": @{first(body('Get_items')?['value'])}
  }
  ```

### 4B. If No - Loan Not Found

In the **If no** branch, add a **"Response"** action:

- **Status Code:** 404
- **Body:**
  ```json
  {
    "ok": false,
    "exists": false,
    "message": "Loan not found"
  }
  ```

### 5. Get Flow URL

1. Save your flow
2. Go back to the HTTP trigger
3. Copy the **HTTP POST URL**
4. Add it to your `.env.local` file:
   ```
   PA_VALIDATE_LOAN_URL=https://prod-xx.region.logic.azure.com:443/workflows/...
   ```

## Flow Overview Diagram

```
HTTP Trigger (loanId)
    ↓
Get items from SharePoint
Filter: ID eq loanId
    ↓
Condition: Items found?
    ↓           ↓
   YES         NO
    ↓           ↓
Response 200   Response 404
(Loan data)    (Not found)
```

## Data Flow

### Request

```json
{
  "loanId": "42"
}
```

### Response (Found - 200)

```json
{
  "ok": true,
  "exists": true,
  "loan": {
    "ID": 42,
    "ClientName": "John Doe",
    "Program": "Course Name"
    // ... other loan fields
  }
}
```

### Response (Not Found - 404)

```json
{
  "ok": false,
  "exists": false,
  "message": "Loan not found"
}
```

## Usage in Application

This endpoint is automatically called by:

1. **Issue Laptop Form** - Validates loan ID before issuing equipment
2. **Request Signature Form** - Validates loan ID before collecting signature

### User Experience

- When user enters a loan ID and submits:
  1. Shows "🔍 Validating loan ID..." message
  2. If found: Proceeds with "📤 Submitting..."
  3. If not found: Shows error "❌ Loan ID 'XX' not found. Please check and try again."

## Alternative: Enhanced Filter Query

If you want to also check the loan status (e.g., only validate approved loans):

**Filter Query:**

```
ID eq @{triggerBody()?['loanId']} and Status eq 'Approved'
```

## Troubleshooting

### Always Returns 404

- Check that the SharePoint list name is correct
- Verify the ID field name (might be different in your list)
- Test the filter query directly in SharePoint: `ID eq 42`
- Check that loan IDs are numbers, not text

### Flow Not Triggering

- Ensure `PA_VALIDATE_LOAN_URL` is set in `.env.local`
- Verify the flow is turned ON
- Check flow run history for errors

### Wrong Status Code

- Make sure both Response actions have correct status codes (200 for found, 404 for not found)
- Verify the condition checks `length(body('Get_items')?['value'])` correctly

## Performance Notes

- This flow runs before every issue/signature submission
- Uses a filtered query for fast lookups
- Only retrieves 1 item (Top Count: 1) for efficiency
- Typical response time: < 500ms

## Security Considerations

- This endpoint only validates existence, doesn't expose sensitive data
- Consider adding rate limiting if needed
- The loan data returned is optional - can return just `{"ok": true, "exists": true}` if preferred
