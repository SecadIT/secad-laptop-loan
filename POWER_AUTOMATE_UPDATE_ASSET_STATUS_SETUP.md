# Power Automate Flow Setup: Update Asset Status

## Overview

This flow updates the status of an asset in the Asset Manager SharePoint list when a laptop is issued to a loan.

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
    "status": {
      "type": "string",
      "description": "The new status value (e.g., 'loaned')"
    },
    "itOfficerEmail": {
      "type": "string",
      "description": "Email of the IT officer issuing the device"
    },
    "loanId": {
      "type": "string",
      "description": "Optional: Loan ID for tracking (requires SharePoint column)"
    }
  },
  "required": ["serialNumber", "status", "itOfficerEmail"]
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
- **Status**: `@{triggerBody()?['status']}`
- **AssignedLoanId**: `@{triggerBody()?['loanId']}` (tracks which loan the asset is assigned to)
- **LastModifiedBy**: `@{triggerBody()?['itOfficerEmail']}` (optional field)

**3b. Response (Success)**

- **Action**: Response
- **Status Code**: 200
- **Body**:

```json
{
  "success": true,
  "message": "Asset status updated successfully",
  "assetId": "@{body('Get_items')?['value'][0]?['ID']}",
  "serialNumber": "@{triggerBody()?['serialNumber']}",
  "newStatus": "@{triggerBody()?['status']}"
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
PA_UPDATE_ASSET_STATUS_URL=your-http-post-url-here
```

## Testing the Flow

### Test Request (using Postman or cURL):

```json
POST {{flow-url}}
Content-Type: application/json

{
  "serialNumber": "SN123456",
  "status": "loaned",
  "itOfficerEmail": "it.officer@example.com"
}
```

### Expected Response:

```json
{
  "success": true,
  "message": "Asset status updated successfully",
  "assetId": "123",
  "serialNumber": "SN123456",
  "newStatus": "loaned"
}
```

## Error Handling

The flow includes:

- ✅ Serial number validation (must exist in Asset Manager)
- ✅ 404 response if asset not found
- ✅ Conditional update logic
- ✅ Loan tracking via AssignedLoanId field
- ⚠️ Application continues even if update fails (logs warning)

## Notes

- Status values should match SharePoint choice column options
- The IT officer email is tracked for audit purposes
- Failed inventory updates don't block the main issue laptop flow
- The `AssignedLoanId` column tracks which loan each asset is assigned to
- All errors are logged to console for debugging
- All errors are logged to console for debugging
