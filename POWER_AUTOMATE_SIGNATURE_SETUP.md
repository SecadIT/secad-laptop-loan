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

### 2. Security: API Key Validation (REQUIRED)

**IMPORTANT:** Add a Condition action immediately after the HTTP trigger to validate the API key. This prevents unauthorized access to your flow.

#### Steps:

1. **Add a Condition action** after the HTTP trigger
2. **Configure the Condition:**
   - Click in the first input field and select **"headers"** from Dynamic content (under "When a HTTP request is received")
   - Type `?['x-pa-api-key']` after `headers` to access the header
   - The full expression should be: `headers?['x-pa-api-key']`
   - Operator: **is equal to**
   - Value: Paste your `PA_API_KEY` value from `.env.local` (e.g., `uLPdeC6uILSQnfH8pRmfvtbzktK2V3kQiOSbWe+jb9k=`)

3. **Configure "If yes" branch:**
   - Add all your normal flow actions here (SharePoint, email, etc.)
   - This is where the flow continues when the API key is valid

4. **Configure "If no" branch:**
   - Add a **"Response"** action
   - Status Code: `401`
   - Body:
     ```json
     {
       "ok": false,
       "error": "Unauthorized - Invalid API key"
     }
     ```
   - Add a **"Terminate"** action
   - Status: **Failed**
   - This stops the flow immediately if the API key is invalid

#### Why This Is Important:

- Without API key validation, anyone with your flow URL could send requests
- The flow URL is included in the Next.js app, so it's not truly secret
- API key validation adds a security layer that prevents unauthorized access
- Even if someone discovers your flow URL, they still need the API key

### 3. Add Actions

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
- **SignatureImage** (Multiple lines of text, Plain text) - Stores the base64 signature image

**Note:** The SignatureImage field stores the complete base64-encoded PNG image (e.g., `data:image/png;base64,iVBORw0KGgo...`). This allows the signature to be displayed in the Next.js app and PDF exports exactly as the client drew it.

### 4. Response Action

Add a **"Response"** action at the end:

- **Status Code:** 200
- **Body:**
  ```json
  {
    "ok": true,
    "message": "Signature received successfully"
  }
  ```

### 5. Get Flow URL

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
