# Power Automate Flow Setup: Send OTP Email

## Overview

This flow sends a 6-digit OTP (One-Time Password) to a user's SECAD email address for authentication.

## Flow Configuration

### 1. Trigger: HTTP Request

- **Type**: When an HTTP request is received
- **Method**: POST
- **Request Body JSON Schema**:

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "description": "The user's SECAD email address"
    },
    "otp": {
      "type": "string",
      "description": "The 6-digit OTP code to send"
    },
    "expiresAt": {
      "type": "string",
      "description": "ISO timestamp when the OTP expires"
    }
  },
  "required": ["email", "otp"]
}
```

### 2. Send Email

- **Action**: Office 365 Outlook - Send an email (V2)
- **To**: `@{triggerBody()?['email']}`
- **Subject**: `Your SECAD Login Code`
- **Body**:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #2563eb;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .content {
        background-color: #f8fafc;
        padding: 30px;
        border: 1px solid #e2e8f0;
        border-radius: 0 0 8px 8px;
      }
      .otp-code {
        font-size: 32px;
        font-weight: bold;
        color: #2563eb;
        letter-spacing: 8px;
        text-align: center;
        padding: 20px;
        background-color: white;
        border: 2px solid #2563eb;
        border-radius: 8px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        color: #64748b;
        font-size: 12px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>SECAD Internal Forms</h2>
        <p>Login Verification Code</p>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>
          You requested to log in to the SECAD Internal Forms system. Use the code below to complete
          your login:
        </p>

        <div class="otp-code">@{triggerBody()?['otp']}</div>

        <p><strong>This code will expire in 5 minutes.</strong></p>

        <p>
          If you didn't request this code, please ignore this email. Your account remains secure.
        </p>

        <p>Best regards,<br />SECAD IT Team</p>
      </div>
      <div class="footer">
        <p>This is an automated email from SECAD Internal Forms System</p>
        <p>Please do not reply to this email</p>
      </div>
    </div>
  </body>
</html>
```

### 3. Response (Success)

- **Action**: Response
- **Status Code**: 200
- **Body**:

```json
{
  "ok": true,
  "message": "OTP sent successfully"
}
```

### 4. Error Handling (Optional but Recommended)

Add a parallel branch with "Configure run after" set to "has failed":

- **Action**: Response
- **Status Code**: 500
- **Body**:

```json
{
  "ok": false,
  "error": "Failed to send OTP email"
}
```

## Environment Variable Setup

After creating the flow:

1. Copy the **HTTP POST URL** from the trigger
2. Add to `.env.local`:

```
PA_SEND_OTP_URL=your-http-post-url-here
```

## Testing the Flow

### Test Request (using Postman or cURL):

```json
POST {{flow-url}}
Content-Type: application/json

{
  "email": "user@secad.ie",
  "otp": "123456",
  "expiresAt": "2026-03-23T12:05:00.000Z"
}
```

### Expected Response:

```json
{
  "ok": true,
  "message": "OTP sent successfully"
}
```

## Security Notes

- OTP is generated server-side and sent via this flow
- The flow only sends emails to `@secad.ie` domain (validated in API)
- OTP expires after 5 minutes
- Each OTP can only be used once
- Email should be sent from an official SECAD account

## Integration Flow

1. User enters email on login page
2. Next.js API generates 6-digit OTP
3. API calls this Power Automate flow
4. Flow sends email with OTP
5. User enters OTP
6. API verifies OTP and creates session

## Email Preview

The email will display:

- SECAD branding header
- Clear OTP code in large, spaced letters
- Expiration warning
- Security notice
- Professional footer

## Troubleshooting

### Email not received

- Check spam/junk folder
- Verify email address is valid @secad.ie domain
- Check flow run history for errors

### Flow fails

- Verify Office 365 Outlook connection is active
- Check sender mailbox has permissions
- Review error details in flow run history
