# Power Automate Flow Setup: Update Loan Status

## Overview

This flow updates the status of a loan in the Laptop Loan List. Used during the return process to mark loans as "Returned".

## Flow Configuration

### 1. Trigger: HTTP Request

- **Type**: When an HTTP request is received
- **Method**: POST
- **Request Body JSON Schema**:

```json
{
  "type": "object",
  "properties": {
    "loanId": {
      "type": "string",
      "description": "The loan ID to update"
    },
    "status": {
      "type": "string",
      "description": "New status value",
      "enum": ["Pending", "Reserved for Loan", "Client Confirmed", "Returned", "Cancelled"]
    },
    "serialNumber": {
      "type": "string",
      "description": "Serial number (available but not used by this flow)"
    },
    "returnDate": {
      "type": "string",
      "description": "Return date (available but not used by this flow)"
    },
    "condition": {
      "type": "string",
      "description": "Equipment condition (available but not used by this flow)"
    },
    "damageNotes": {
      "type": "string",
      "description": "Damage notes (available but not used by this flow)"
    },
    "itemsReturned": {
      "type": "string",
      "description": "Items returned (available but not used by this flow)"
    },
    "witnessName": {
      "type": "string",
      "description": "Witness name (available but not used by this flow)"
    },
    "witnessEmail": {
      "type": "string",
      "description": "Witness email (available but not used by this flow)"
    }
  },
  "required": ["loanId", "status"]
}
```

**Note**: This flow receives the complete return payload (same as PA_RETURN_LAPTOP_URL) but only uses `loanId` and `status`. The additional fields are sent for consistency but can be ignored.

---

### 2. Get Loan Item

- **Action**: SharePoint - Get item
- **Site Address**: Your SharePoint site
- **List Name**: Laptop Loan List
- **Id**: `@{triggerBody()?['loanId']}`

**Purpose**: Retrieve the loan record to verify it exists

---

### 3. Condition: Check if Loan Found

- **Condition**: Check if Get item action succeeded
- Use the "Configure run after" to handle cases where item is not found

#### If Yes (Item Found):

### 4. Update Loan Status

- **Action**: SharePoint - Update item
- **Site Address**: Your SharePoint site
- **List Name**: Laptop Loan List
- **Id**: `@{triggerBody()?['loanId']}`
- **Fields to Update**:
  - **Identity and Status**: `@{triggerBody()?['status']}`

**Purpose**: Update the loan status

---

### 5. Return Success Response

- **Action**: Response
- **Status Code**: 200
- **Body**:

```json
{
  "ok": true,
  "message": "Loan status updated successfully",
  "loanId": "@{triggerBody()?['loanId']}",
  "status": "@{triggerBody()?['status']}"
}
```

#### If No (Item Not Found):

### 6. Return Error Response

- **Action**: Response
- **Status Code**: 404
- **Body**:

```json
{
  "ok": false,
  "error": "Loan not found",
  "loanId": "@{triggerBody()?['loanId']}"
}
```

---

## Testing

### Test Data (Minimal)

You can test with just the required fields:

```json
{
  "loanId": "1",
  "status": "Returned"
}
```

### Production Payload (Complete)

In production, this flow receives the complete return data (same as PA_RETURN_LAPTOP_URL):

```json
{
  "loanId": "1",
  "serialNumber": "ABC123",
  "returnDate": "2026-03-23",
  "condition": "Good",
  "damageNotes": "",
  "itemsReturned": "Laptop, Charger",
  "witnessName": "John Doe",
  "witnessEmail": "john.doe@secad.ie",
  "status": "Returned"
}
```

The flow extracts only `loanId` and `status` - other fields are ignored.

### Expected Behavior

1. ✅ Loan status updated in Laptop Loan List
2. ✅ Returns success response with loan details

---

## Environment Variable

Add the flow URL to your `.env.local`:

```
PA_UPDATE_LOAN_STATUS_URL=your-power-automate-update-loan-status-flow-url
```

---

## API Endpoint

**Endpoint**: `/api/return-laptop`  
**Method**: POST

This API calls two separate flows with the **same payload**:

1. `PA_RETURN_LAPTOP_URL` - Updates Asset Manager (uses all fields)
2. `PA_UPDATE_LOAN_STATUS_URL` - Updates Loan List (uses only loanId + status)

**Request Body** (sent to both flows):

```json
{
  "loanId": "1",
  "serialNumber": "ABC123",
  "returnDate": "2026-03-23",
  "condition": "Good",
  "damageNotes": "",
  "itemsReturned": "Laptop, Charger",
  "witnessName": "John Doe",
  "witnessEmail": "john.doe@secad.ie",
  "status": "Returned"
}
```

**Response**:

```json
{
  "ok": true,
  "message": "Laptop return processed successfully",
  "assetUpdate": { ... },
  "loanUpdate": { ... }
}
```

---

## Troubleshooting

### Status not updating

- Verify the loan ID exists in Laptop Loan List
- Check that the status value matches one of the allowed choices in SharePoint:
  - Pending
  - Reserved for Loan
  - Client Confirmed
  - Returned
  - Cancelled

### Flow failing silently

- Check Power Automate run history
- Verify SharePoint permissions for the flow connection
- Ensure the "Identity and Status" column name matches your SharePoint list

---

## Related Flows

- **Return Laptop**: Updates Asset Manager with return details
- **Issue Laptop**: Creates loan reservations
- **Signature**: Updates loan to "Client Confirmed"

---

## Flow Diagram

```
HTTP Request (POST)
    ↓
Get Loan Item (SharePoint)
    ↓
Check if Found?
    ↓
Yes → Update Loan Status → Success Response (200)
    ↓
No → Error Response (404)
```
