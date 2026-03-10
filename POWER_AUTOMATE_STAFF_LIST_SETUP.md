# Power Automate Staff List Setup Guide

This guide explains how to set up the Power Automate flow to provide staff data from SharePoint to the laptop loan forms.

## SharePoint List Setup

### List Name

`Staff` (or any name you prefer, but update the Power Automate flow accordingly)

### List Columns

1. **User** (Person or Group)
   - Type: Person or Group
   - Settings: Allow selection of "People Only"
   - SharePoint column name: Can be "User", "Person", or any name you choose
   - Power Automate returns this field as shown in the Expand Query setting
   - This field returns: DisplayName, Email, Claims

2. **Role** (Choice)
   - Type: Choice
   - Choices:
     - DO (Development Officer)
     - IT (IT Staff)
     - FOH (Front of House)
   - Default: None

3. **Active** (Yes/No)
   - Type: Yes/No
   - Default: Yes
   - Used to filter out former staff without deleting records

### Sample Data

Add your staff members with their roles:

- User: Select from tenant users (people picker)
- Role: DO, IT, or FOH
- Active: Yes

## Power Automate Flow Setup

### 1. Create HTTP Trigger

1. Go to **Power Automate** → **Create** → **Instant cloud flow**
2. Name: "Get Staff List"
3. Choose trigger: **When a HTTP request is received**
4. Skip the JSON schema for now (click Next)

### 2. Add SharePoint Get Items Action

1. Click **+ New step**
2. Search for "SharePoint" and select **Get items** action
3. Configure:
   - **Site Address**: Select your SharePoint site
   - **List Name**: Select "Staff" (or your list name)
   - **Filter Query**: `Active eq true` (only return active staff)
   - **Top Count**: Leave blank or set to 500
   - **Expand Query**: `User` (to get full user details)

### 3. Add Response Action

1. Click **+ New step**
2. Search for "Response" and select **Response** action
3. Configure:
   - **Status Code**: 200
   - **Body**: Use this JSON structure:

```json
{
  "staffs": @{outputs('Get_items')?['body/value']},
  "count": @{length(outputs('Get_items')?['body/value'])}
}
```

**Important:** The property must be named `"staffs"` (plural) to match the application code.

4. Add a header:
   - **Key**: `Content-Type`
   - **Value**: `application/json`

### 4. Configure HTTP Trigger Settings

1. Go back to the HTTP trigger at the top
2. Click **Show advanced options**
3. Set **Method**: `GET`
4. Set **Who can trigger**: `Anyone` (or specific users if you prefer)

### 5. Save and Get URL

1. Click **Save** in the top right
2. Go back to the HTTP trigger
3. Copy the **HTTP GET URL** that appears
4. This is your Power Automate endpoint URL

## Application Setup

### 1. Add Environment Variable

In your `.env.local` file, add:

```
PA_STAFF_LIST_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/...
```

Replace with your actual Power Automate flow URL from step 5 above.

### 2. Test the Integration

1. Start your Next.js application: `npm run dev`
2. Navigate to "Request Laptop Loan" page
3. The Development Officer dropdown should populate with staff from SharePoint
4. Navigate to "Issue Laptop" page
5. Both dropdowns should show filtered staff (DO and IT roles)

## How It Works

### Staff Store (Zustand)

- **Location**: `lib/stores/staff-store.ts`
- **Caching**: 5-minute cache to minimize API calls
- **Features**:
  - `fetchStaff()` - Fetches staff from Power Automate
  - `getStaffByRole(role)` - Filters staff by role (DO, IT, FOH)
  - Automatic filtering of inactive staff

### API Route

- **Location**: `app/api/staff/route.ts`
- **Method**: GET
- **Returns**: Array of staff members with Person details and roles

### Form Integration

#### Request Form

- **Development Officer**: Dropdown filtered by `Role === 'DO'`
- Displays: `DisplayName (Email)`
- Submits: `DisplayName` and `Email` to SharePoint

#### Issue Form

- **DO Collecting Equipment**: Dropdown filtered by `Role === 'DO'`
- **IT Assistant**: Dropdown filtered by `Role === 'IT'`
- Both display: `DisplayName` only
- Both submit: `DisplayName` to SharePoint

## Data Structure

Power Automate returns data in this format:

```json
{
  "staffs": [
    {
      "ID": 1,
      "User": {
        "DisplayName": "John Smith",
        "Email": "john.smith@secad.ie",
        "Claims": "i:0#.f|membership|john.smith@secad.ie"
      },
      "Role": {
        "Value": "DO",
        "Id": 0
      },
      "Active": true
    },
    {
      "ID": 2,
      "User": {
        "DisplayName": "Jane Doe",
        "Email": "jane.doe@secad.ie",
        "Claims": "i:0#.f|membership|jane.doe@secad.ie"
      },
      "Role": {
        "Value": "IT",
        "Id": 1
      },
      "Active": true
    }
  ],
  "count": 2
}
```

## Troubleshooting

- **No staff showing**: Check browser console and Power Automate run history
- **Wrong roles**: Verify Role column values match exactly: "DO", "IT", "FOH"
- **403/401 errors**: Ensure "Who can trigger" is set to "Anyone" in the HTTP trigger
- **Empty dropdown**: Check if Active filter is correct and staff are marked as Active
- **Person field empty**: In Power Automate Get items action, ensure "Expand Query" is set to `Person`

## Benefits

✅ **No typos** - Staff selected from validated SharePoint list  
✅ **Data consistency** - Same person data across all forms  
✅ **Automatic sync** - Person fields stay current with Microsoft 365/Azure AD  
✅ **Role-based filtering** - Forms only show relevant staff  
✅ **Easy maintenance** - Update staff in one place  
✅ **Performance** - 5-minute caching minimizes API calls

## SharePoint List Management

### Adding New Staff

1. Go to your SharePoint Staff list
2. Click **+ New**
3. Select Person from tenant users
4. Choose Role (DO, IT, or FOH)
5. Set Active to Yes
6. Click **Save**

### Deactivating Staff

1. Edit the staff member's item
2. Set Active to No
3. Click **Save**
4. They will no longer appear in dropdowns (cached for up to 5 minutes)

### Updating Roles

1. Edit the staff member's item
2. Change the Role
3. Click **Save**
4. Forms will update within 5 minutes (or use Refresh button)
