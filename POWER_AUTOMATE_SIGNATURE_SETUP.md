# Power Automate Signature Flow Setup Guide

This guide explains how to set up the Power Automate flow to receive signature form submissions from the Next.js application.

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
    "confirmReceipt": {
      "type": "boolean"
    },
    "agreeTerms": {
      "type": "boolean"
    },
    "printedName": {
      "type": "string"
    },
    "agreeSignature": {
      "type": "boolean"
    },
    "signatureDate": {
      "type": "string"
    },
    "signatureImage": {
      "type": "string"
    }
  }
}
```

### 2. Add Actions

After the HTTP trigger, add your desired actions:

- **Create item** in SharePoint list
- **Send email** notification
- **Update item** in existing loan list
- Any other business logic

Example SharePoint columns to create:

- **LoanID** (Single line of text)
- **ConfirmReceipt** (Yes/No)
- **AgreeTerms** (Yes/No)
- **PrintedName** (Single line of text)
- **AgreeSignature** (Yes/No)
- **SignatureDate** (Date and Time)
- **SignatureImage** (Multiple lines of text)

### 3. Response Action

Add a **"Response"** action at the end:

- **Status Code:** 200
- **Body:**
  ```json
  {
    "ok": true,
    "message": "Signature received successfully"
  }
  ```

### 4. Get Flow URL

1. Save your flow
2. Go back to the HTTP trigger
3. Copy the **HTTP POST URL**
4. Add it to your `.env.local` file:
   ```
   PA_SIGNATURE_FLOW_URL=https://prod-xx.westus.logic.azure.com:443/workflows/...
   ```

## Data Fields

| Field          | Type    | Description                                        |
| -------------- | ------- | -------------------------------------------------- |
| loanId         | string  | The loan ID reference                              |
| confirmReceipt | boolean | Confirms receipt of equipment                      |
| agreeTerms     | boolean | Agrees to terms and conditions                     |
| printedName    | string  | Client's printed full name                         |
| agreeSignature | boolean | Agrees that typed name is electronic signature     |
| signatureDate  | string  | ISO date string (e.g., "2026-03-10T12:00:00.000Z") |
| signatureImage | string  | Base64 encoded signature image from canvas         |

## Troubleshooting

### Empty or Missing Data

- Check that the HTTP trigger schema matches exactly
- Verify all dynamic content mappings in SharePoint/actions

### Connection Issues

- Ensure `PA_SIGNATURE_FLOW_URL` is set in `.env.local`
- Verify the flow is turned ON
- Check flow run history for errors

### Date Format

- The `signatureDate` is sent as ISO 8601 format
- Use Power Automate's `formatDateTime()` if you need a different format
- Example: `formatDateTime(triggerBody()?['signatureDate'], 'MM/dd/yyyy')`

### Signature Image

- The signature is sent as a base64 data URL string
- Format: `data:image/png;base64,iVBORw0KG...`
- Can be stored directly in SharePoint Multiple lines of text field
- Can be extracted and saved as attachment if needed

## Example Flow Steps

1. **When a HTTP request is received** (trigger)
2. **Compose** - Format the date: `formatDateTime(triggerBody()?['signatureDate'], 'dd/MM/yyyy')`
3. **Create item** - Save to SharePoint Signatures list
4. **Update item** - Update the original loan record with signature info
5. **Send an email** - Notify relevant parties
6. **Response** - Return success to the application
