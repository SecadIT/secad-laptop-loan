# Power Automate Asset Manager List Setup

This document provides step-by-step instructions for setting up a Power Automate flow to retrieve the Asset Manager list from SharePoint.

## Overview

This flow retrieves all items from the Asset Manager SharePoint list and returns them to the Next.js application API endpoint.

## Prerequisites

- Access to Power Automate (premium license required for HTTP requests)
- Access to the SharePoint site containing the Asset Manager list
- The Asset Manager list must already exist in SharePoint

## Flow Setup Steps

### 1. Create a New Flow

1. Go to [Power Automate](https://make.powerautomate.com/)
2. Click **+ Create** → **Instant cloud flow**
3. Name it: "Get Asset Manager List Items"
4. Select trigger: **When an HTTP request is received**
5. Click **Create**

### 2. Configure the HTTP Request Trigger

1. In the **When an HTTP request is received** trigger:
   - **Method**: GET
   - Leave **Request Body JSON Schema** empty (not needed for GET)
2. The flow will generate a URL after you save it

### 3. Security: API Key Validation (REQUIRED)

**IMPORTANT:** Add a Condition action immediately after the HTTP trigger to validate the API key. This prevents unauthorized access to your flow.

#### Steps:

1. **Add a Condition action** after the HTTP trigger
2. **Configure the Condition:**
   - Click in the first input field and select **"headers"** from Dynamic content (under "When an HTTP request is received")
   - Type `?['x-pa-api-key']` after `headers` to access the header
   - The full expression should be: `headers?['x-pa-api-key']`
   - Operator: **is equal to**
   - Value: Paste your `PA_API_KEY` value from `.env.local` (e.g., `uLPdeC6uILSQnfH8pRmfvtbzktK2V3kQiOSbWe+jb9k=`)

3. **Configure "If yes" branch:**
   - Add all your normal flow actions here (Get items, Variables, Response, etc.)
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
- The flow URL is embedded in the Next.js app, so it's not truly secret
- API key validation adds a security layer that prevents unauthorized access
- Even if someone discovers your flow URL, they still need the API key

### 4. Add Get Items Action

1. Click **+ New step**
2. Search for "SharePoint" and select **Get items**
3. Configure the action:
   - **Site Address**: Select your SharePoint site
   - **List Name**: Select your "Asset Manager" list
   - **Top Count**: Leave blank or set to a high number (e.g., 5000) to get all items

### 5. Initialize Assets Array Variable

1. Click **+ New step**
2. Search for "Variables" and select **Initialize variable**
3. Configure:
   - **Name**: `Assets`
   - **Type**: Array
   - **Value**: Leave empty

### 6. Loop Through Items and Build Response

1. Click **+ New step**
2. Search for "Apply to each" and select it
3. In **Select an output from previous steps**, select: `value` (from Get items)
4. Inside the loop, click **Add an action**
5. Search for "Variables" and select **Append to array variable**
6. Configure:
   - **Name**: `Assets`
   - **Value**: Click in the field and add dynamic content with your asset fields

   Example JSON structure to build (adapt based on your SharePoint columns):

   ```json
   {
     "ID": [ID from Get items],
     "Title": [Title from Get items],
     "AssetType": [AssetType from Get items],
     "Make": [Make from Get items],
     "Model": [Model from Get items],
     "SerialNumber": [SerialNumber from Get items],
     "PurchaseDate": [PurchaseDate from Get items],
     "Status": [Status from Get items],
     "AssignedTo": [AssignedTo from Get items],
     "Location": [Location from Get items],
     "Notes": [Notes from Get items]
   }
   ```

### 7. Add Response Action

1. After the **Apply to each** loop, click **+ New step**
2. Search for "Response" and select **Response**
3. Configure:
   - **Status Code**: 200
   - **Headers**:
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**:
     ```json
     {
       "assets": [use Assets variable from dynamic content]
     }
     ```

### 8. Save and Get the Flow URL

1. Click **Save** at the top
2. Go back to the **When an HTTP request is received** trigger
3. Copy the **HTTP GET URL** that was generated

## Next.js Configuration

### Add Environment Variable

Add the following to your `.env.local` file:

```env
PA_ASSETS_LIST_URL=your-power-automate-flow-url-here
```

Replace `your-power-automate-flow-url-here` with the URL you copied from Power Automate.

### Restart Development Server

After adding the environment variable, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

## Testing

### Test in Power Automate

1. In your flow, click **Test** in the top right
2. Select **Manually**
3. Click **Test**
4. The flow should run and return your assets list

### Test in Next.js

1. Start your development server
2. Navigate to: `http://localhost:3000/inventory`
3. Open browser console (F12)
4. The asset structure will be logged in the terminal where Next.js is running
5. Check the console for the logged structure

### Expected API Response

```json
{
  "ok": true,
  "assets": [
    {
      "ID": 1,
      "Title": "Laptop - Dell Latitude 5420",
      "AssetType": "Laptop",
      "Make": "Dell",
      "Model": "Latitude 5420",
      "SerialNumber": "ABC123456",
      "Status": "Available",
      ...
    }
  ],
  "count": 1
}
```

## Troubleshooting

### Flow returns empty array

- Check that your Asset Manager list has items
- Verify the List Name in the Get items action is correct
- Check that the flow has permission to access the SharePoint list

### Environment variable not found

- Make sure `.env.local` file exists in the project root
- Restart the Next.js development server after adding variables
- Verify the variable name matches exactly: `PA_ASSETS_LIST_URL`

### Console not showing structure

- Check the terminal/console where Next.js is running (not browser console)
- Make sure the API endpoint is being called
- Check for any error messages in the terminal

## Next Steps

After confirming the structure is logged correctly:

1. Review the console output to understand the data structure
2. Create a TypeScript interface for the Asset type
3. Build the inventory table component based on the structure
4. Create an asset store similar to the loan store
