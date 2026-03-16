# Power Automate Flow Setup: Update Asset to Loaned

## Overview

This flow updates the status of an asset to "Loaned" in the Asset Manager SharePoint list after a client signs for the equipment.

## Flow Configuration

### 1. Trigger: HTTP Request

- **Type**: When an HTTP request is received
- **Method**: POST
- **Request Body JSON Schema**:

```json
{
  "type": "object",
  "properties": {
    "serialNumber": {
      "type": "string",
      "description": "The serial number of the asset to update"
    },
    "itOfficerEmail": {
      "type": "string",
      "description": "Optional: Email of the IT officer who issued the device"
    },
    "loanId": {
      "type": "string",
      "description": "Loan ID for tracking"
    }
  },
  "required": ["serialNumber"]
}
```

### 2. Get Items (Find Asset by Serial Number)

- **Action**: SharePoint - Get items
- **Site Address**: Your SharePoint site
- **List Name**: Asset Manager
- **Filter Query**: `SerialNumber eq '@{triggerBody()?['serialNumber']}'`
- **Top Count**: 1

### 3. Condition: Check if Asset Found

- **Condition**: `length(body('Get_items')?['value'])` is greater than `0`

#### If Yes (Asset Found):

**3a. Update Item**

- **Action**: SharePoint - Update item
- **Site Address**: Your SharePoint site
- **List Name**: Asset Manager
- **Id**: `body('Get_items')?['value'][0]?['ID']`
- **Status**: Select **"Loaned"** from the dropdown (Choice field)
- **AssignedLoanId**: `@{triggerBody()?['loanId']}` (tracks which loan the asset is assigned to)
- **LastModifiedBy**: `@{triggerBody()?['itOfficerEmail']}` (optional field)

**3b. Response (Success)**

- **Action**: Response
- **Status Code**: 200
- **Body**:

```json
{
  "success": true,
  "message": "Asset status updated to loaned successfully",
  "assetId": "@{body('Get_items')?['value'][0]?['ID']}",
  "serialNumber": "@{triggerBody()?['serialNumber']}",
  "newStatus": "Loaned"
}
```

#### If No (Asset Not Found):

**3c. Response (Not Found)**

- **Action**: Response
- **Status Code**: 404
- **Body**:

```json
{
  "success": false,
  "error": "Asset not found",
  "serialNumber": "@{triggerBody()?['serialNumber']}"
}
```

## Environment Variable Setup

After creating the flow:

1. Copy the **HTTP POST URL** from the trigger
2. Add to `.env.local`:

```
PA_UPDATE_TO_LOANED_URL=your-http-post-url-here
```

## Testing the Flow

### Test Request (using Postman or cURL):

```json
POST {{flow-url}}
Content-Type: application/json

{
  "serialNumber": "SN123456",
  "loanId": "1"
}
```

### Expected Response:

```json
{
  "success": true,
  "message": "Asset status updated to loaned successfully",
  "assetId": "123",
  "serialNumber": "SN123456",
  "newStatus": "Loaned"
}
```

## Integration Flow

This flow is called as part of the signature submission process:

1. Client fills out loan request form
2. IT officer issues laptop (status → "Reserved for Loan")
3. Client signs for equipment (triggers this flow)
4. **Asset status updated to "Loaned"** ✅

## Error Handling

The flow includes:

- ✅ Serial number validation (must exist in Asset Manager)
- ✅ 404 response if asset not found
- ✅ Conditional update logic
- ✅ Loan tracking via AssignedLoanId field
- ⚠️ Application logs warnings if update fails but continues

## Notes

- Status is set to the **"Loaned"** choice value (not a text string)
- The IT officer email is optional at the signature stage
- Failed inventory updates don't block the signature flow
- The `AssignedLoanId` column tracks which loan each asset is assigned to
- Signature date is automatically captured in the Power Automate flow using expression
- All errors are logged to console for debugging
