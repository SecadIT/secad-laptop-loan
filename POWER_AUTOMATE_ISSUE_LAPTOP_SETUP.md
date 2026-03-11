# Power Automate Issue Laptop Flow Setup Guide

This guide explains how to set up the Power Automate flow to receive issue laptop form submissions from the Next.js application.

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
    },
    "makeAndModelOfDevice": {
      "type": "string"
    },
    "serialNumber": {
      "type": "string"
    },
    "itemsIncluded": {
      "type": "string"
    },
    "nameDOCollectingEquipment": {
      "type": "string"
    },
    "nameSecadITAssistant": {
      "type": "string"
    }
  }
}
```

### 2. Add Actions

After the HTTP trigger, add your desired actions:

- **Update item** in SharePoint loan list (to mark as issued)
- **Create item** in equipment tracking list
- **Send email** notification to DO and IT staff
- Any other business logic

Example SharePoint columns to create for Equipment Tracking:

- **LoanID** (Single line of text)
- **MakeAndModel** (Single line of text)
- **SerialNumber** (Single line of text)
- **ItemsIncluded** (Multiple lines of text)
- **DevelopmentOfficer** (Person or Single line of text)
- **ITAssistant** (Person or Single line of text)
- **IssuedDate** (Date and Time)

### 3. Response Action

Add a **"Response"** action at the end:

- **Status Code:** 200
- **Body:**
  ```json
  {
    "ok": true,
    "message": "Issue laptop form received successfully"
  }
  ```

### 4. Get Flow URL

1. Save your flow
2. Go back to the HTTP trigger
3. Copy the **HTTP POST URL**
4. Add it to your `.env.local` file:
   ```
   PA_ISSUE_LAPTOP_FLOW_URL=https://prod-xx.region.logic.azure.com:443/workflows/...
   ```

## Data Fields

| Field                     | Type   | Description                                        |
| ------------------------- | ------ | -------------------------------------------------- |
| loanId                    | string | Reference to the original loan request             |
| makeAndModelOfDevice      | string | Device make and model (e.g., "Dell Latitude 5420") |
| serialNumber              | string | Device serial number for tracking                  |
| itemsIncluded             | string | List of items included with the device             |
| nameDOCollectingEquipment | string | Development Officer's full name (from Staff list)  |
| nameSecadITAssistant      | string | IT Assistant's full name (from Staff list)         |

## Typical Flow Actions

### Update Original Loan Record

```
Update item (SharePoint)
- Site Address: Your SharePoint site
- List Name: Laptop Loans
- Id: triggerBody()?['loanId']
- Status: Issued
- IssuedDate: utcNow()
- IssuedBy: triggerBody()?['nameSecadITAssistant']
```

### Create Equipment Tracking Record

```
Create item (SharePoint)
- Site Address: Your SharePoint site
- List Name: Equipment Tracking
- Title: triggerBody()?['makeAndModelOfDevice']
- SerialNumber: triggerBody()?['serialNumber']
- ItemsIncluded: triggerBody()?['itemsIncluded']
- AssignedTo: triggerBody()?['nameDOCollectingEquipment']
- IssuedBy: triggerBody()?['nameSecadITAssistant']
- IssuedDate: utcNow()
```

### Send Email Notification

```
Send an email (V2)
- To: [DO Email], [IT Email]
- Subject: Equipment Issued - Loan ID @{triggerBody()?['loanId']}
- Body: Device @{triggerBody()?['makeAndModelOfDevice']} (SN: @{triggerBody()?['serialNumber']}) has been issued to @{triggerBody()?['nameDOCollectingEquipment']}
```

## Troubleshooting

### Empty or Missing Data

- Check that the HTTP trigger schema matches exactly
- Verify all dynamic content mappings in SharePoint/actions
- Check that staff names are being passed correctly

### Flow Not Triggering

- Ensure `PA_ISSUE_LAPTOP_FLOW_URL` is set in `.env.local`
- Verify the flow is turned ON
- Check the URL format matches Power Automate standard (not Power Platform direct URL)
- Check flow run history for errors

### Staff Names Not Matching

- Staff names come from the Staff list via dropdowns
- They are the DisplayName values from SharePoint Person fields
- Ensure Staff list has correct Person field values

## Integration Notes

- This form uses the Staff store to populate DO and IT dropdowns
- Staff members are filtered by Role (DO or IT) from the Staff list
- Only active staff members appear in dropdowns
- The form validates that both DO and IT are selected before submission
