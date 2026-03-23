# Power Automate Flow Setup: Return Laptop

## Overview

This flow processes laptop returns by updating the asset in the Asset Manager list with return details and setting its status to "Available".

**Note**: The Loan List status update is handled by a separate flow (see `POWER_AUTOMATE_UPDATE_LOAN_STATUS_SETUP.md`). During the return process, the application calls both flows:

- `PA_RETURN_LAPTOP_URL` - This flow (Asset Manager updates)
- `PA_UPDATE_LOAN_STATUS_URL` - Updates Loan List status to "Returned"

---

## Prerequisites

### Required SharePoint Columns in Asset Manager List

Before setting up this flow, ensure your Asset Manager list has these columns. If they don't exist, add them:

1. **ReturnDate** (Date and Time)
   - Type: Date and Time
   - Date only (no time)
   - Optional

2. **ReturnCondition** (Choice)
   - Type: Choice
   - Choices:
     - Good
     - Fair
     - Damaged
   - Optional

3. **DamageNotes** (Multiple lines of text)
   - Type: Multiple lines of text
   - Plain text
   - Optional

4. **ItemsReturned** (Multiple lines of text)
   - Type: Multiple lines of text
   - Plain text
   - Optional

5. **ReturnWitness** (Single line of text)
   - Type: Single line of text
   - Optional

**To add columns to your SharePoint list:**

1. Go to your Asset Manager list in SharePoint
2. Click the **+ Add column** button
3. Select the appropriate column type
4. Enter the column name exactly as shown above
5. Configure the settings as specified
6. Click **Save**

---

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
      "description": "The loan ID to mark as returned"
    },
    "serialNumber": {
      "type": "string",
      "description": "Serial number of the asset being returned"
    },
    "returnDate": {
      "type": "string",
      "description": "Date the equipment was returned (ISO format)"
    },
    "condition": {
      "type": "string",
      "description": "Condition of returned equipment",
      "enum": ["Good", "Fair", "Damaged"]
    },
    "damageNotes": {
      "type": "string",
      "description": "Notes about any damage (optional)"
    },
    "itemsReturned": {
      "type": "string",
      "description": "Comma-separated list of items returned"
    },
    "witnessName": {
      "type": "string",
      "description": "Name of staff member witnessing the return"
    },
    "witnessEmail": {
      "type": "string",
      "description": "Email of staff member witnessing the return"
    },
    "status": {
      "type": "string",
      "description": "Loan status (available but not used by this flow - always 'Returned')"
    }
  },
  "required": [
    "loanId",
    "serialNumber",
    "returnDate",
    "condition",
    "itemsReturned",
    "witnessName",
    "witnessEmail"
  ]
}
```

**Note**: This flow receives the complete return payload (same as PA_UPDATE_LOAN_STATUS_URL). The `status` field is included for consistency but not used by this flow since it only updates Asset Manager.

---

### 2. Get Asset by Serial Number

- **Action**: SharePoint - Get items
- **Site Address**: Your SharePoint site
- **List Name**: Asset Manager
- **Filter Query**: `SerialNumber eq '@{triggerBody()?['serialNumber']}'`
- **Top Count**: 1

**Purpose**: Find the asset that's being returned

---

### 3. Condition: Check if Asset Found

- **Condition**: `@{length(body('Get_Asset_by_Serial_Number')?['value'])}`
- **Operator**: is greater than
- **Value**: 0

---

### 4. If Yes: Update Asset with Return Details

- **Action**: SharePoint - Update item
- **Site Address**: Your SharePoint site
- **List Name**: Asset Manager
- **Id**: `@{body('Get_Asset_by_Serial_Number')?['value'][0]['ID']}`
- **Fields to Update**:
  - **Status**: `Available`
  - **ReturnDate**: `@{triggerBody()?['returnDate']}`
  - **ReturnCondition**: `@{triggerBody()?['condition']}`
  - **DamageNotes**: `@{triggerBody()?['damageNotes']}`
  - **ItemsReturned**: `@{triggerBody()?['itemsReturned']}`
  - **ReturnWitness**: `@{triggerBody()?['witnessName']} (@{triggerBody()?['witnessEmail']})`

**Purpose**: Update asset status to Available and record all return details

---

### 5. If Yes: Return Success Response

- **Action**: Response
- **Status Code**: 200
- **Body**:

```json
{
  "ok": true,
  "message": "Asset return details updated successfully",
  "loanId": "@{triggerBody()?['loanId']}",
  "serialNumber": "@{triggerBody()?['serialNumber']}",
  "assetStatus": "Available"
}
```

---

### 6. If No: Return Asset Not Found Error

- **Action**: Response
- **Status Code**: 404
- **Body**:

```json
{
  "ok": false,
  "error": "Asset with serial number @{triggerBody()?['serialNumber']} not found"
}
```

---

### 7. Error Handling (Configure Run After)

Add a parallel branch configured to run after previous actions fail:

- **Action**: Response
- **Status Code**: 500
- **Body**:

```json
{
  "ok": false,
  "error": "Failed to process laptop return"
}
```

---

## Flow Diagram

```
HTTP Request (POST)
    ↓
Get Asset by Serial Number
    ↓
Condition: Asset Found?
    ↓
[YES] Update Asset:
      - Status: Available
      - ReturnDate
      - ReturnCondition
      - DamageNotes
      - ItemsReturned
      - ReturnWitness
    ↓
    Success Response (200)

[NO] → Error Response (404)

Note: Loan List status update handled separately
      by PA_UPDATE_LOAN_STATUS_URL flow
```

    Return Success (200)

[NO] Return Error (404)

[ERROR] Return Error (500)

````

---

## Environment Variable Setup

After creating the flow:

1. Copy the **HTTP POST URL** from the trigger
2. Add to `.env.local`:

```env
PA_RETURN_LAPTOP_URL=your-http-post-url-here
PA_UPDATE_LOAN_STATUS_URL=your-update-loan-status-flow-url-here
````

**Note**: Both flows are required for the complete return process:

- `PA_RETURN_LAPTOP_URL` - Updates Asset Manager (this flow)
- `PA_UPDATE_LOAN_STATUS_URL` - Updates Loan List status (see `POWER_AUTOMATE_UPDATE_LOAN_STATUS_SETUP.md`)

---

## Testing the Flow

### Test Request (using Postman or cURL):

**Note**: In production, both flows receive the same complete payload. For testing this flow individually, you can omit the `status` field.

```json
POST {{flow-url}}
Content-Type: application/json

{
  "loanId": "123",
  "serialNumber": "SN123456",
  "returnDate": "2026-03-23T10:00:00.000Z",
  "condition": "Good",
  "damageNotes": "",
  "itemsReturned": "Laptop, Charger, Bag",
  "witnessName": "John Doe",
  "witnessEmail": "john.doe@secad.ie",
  "status": "Returned"
}
```

**What this flow uses**: All fields except `status` (which is for the Loan List)

### Expected Success Response:

```json
{
  "ok": true,
  "message": "Asset return details updated successfully",
  "loanId": "123",
  "serialNumber": "SN123456",
  "assetStatus": "Available"
}
```

### Expected Error Response (Asset Not Found):

```json
{
  "ok": false,
  "error": "Asset with serial number SN123456 not found"
}
```

---

## SharePoint List Fields Required

### Laptop Loan List

- **Identity and Status** (Choice field) - Add "Returned" option if not exists

### Asset Manager List

**New fields to create:**

- **ReturnDate** (Date and Time)
- **ReturnCondition** (Choice: Good, Fair, Damaged)
- **DamageNotes** (Multiple lines of text)
- **ItemsReturned** (Multiple lines of text)
- **ReturnWitness** (Single line of text)

**Existing field to update:**

- **Status** (Choice) - Ensure "Available" option exists

---

## Data Flow Summary

### What Gets Updated:

**Loan List (Laptop Loan List):**

- ✅ Status: `Client Confirmed` → `Returned`

**Asset List (Asset Manager):**

- ✅ Status: `Loaned Out` → `Available`
- ✅ ReturnDate: Recorded
- ✅ ReturnCondition: Good/Fair/Damaged
- ✅ DamageNotes: Any damage description
- ✅ ItemsReturned: List of items returned
- ✅ ReturnWitness: Staff member who witnessed return

---

## Integration Flow

1. User opens Return Laptop form
2. Selects loan (filtered by status "Loaned")
3. Fills in return details (condition, items, etc.)
4. Selects witness (IT or Front House staff)
5. Submits form
6. Next.js API calls this Power Automate flow
7. Flow updates loan status to "Returned"
8. Flow updates asset status to "Available" + return details
9. Success response returned
10. UI refreshes loan/asset stores

---

## Security & Validation

- Loan ID must exist in the Laptop Loan List
- Serial number must exist in Asset Manager
- Only loans with status "Client Confirmed" should be processed (validated in frontend)
- All return details are recorded for audit trail
- Return witness provides accountability

---

## Troubleshooting

### Flow fails to find asset

- Verify serial number format matches Asset Manager list
- Check filter query syntax in "Get Asset by Serial Number" step
- Ensure SerialNumber field exists and is populated

### Status update fails

- Verify "Returned" option exists in Loan List Status field
- Verify "Available" option exists in Asset Manager Status field
- Check field internal names match

### Return fields not updating

- Ensure all return fields exist in Asset Manager list
- Check field types match (Date, Choice, Text)
- Verify field internal names are correct

---

## Notes

- The return witness can be either IT staff or Front House staff
- Damage notes are optional (can be empty string)
- Items returned should be comma-separated for consistency
- Asset is immediately marked as Available after return
- All return details provide full audit trail
