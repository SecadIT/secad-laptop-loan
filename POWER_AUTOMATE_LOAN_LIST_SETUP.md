# Power Automate Setup for Loan List

## Create a Power Automate Flow to Get SharePoint Loan Data

### Step 1: Create New Flow

1. Go to [Power Automate](https://make.powerautomate.com)
2. Click **+ Create** → **Instant cloud flow**
3. Name it: "Get Laptop Loans List"
4. Choose trigger: **When a HTTP request is received**
5. Click **Create**

### Step 2: Configure HTTP Trigger

1. In the HTTP trigger:
   - **Method**: Select **GET** from the dropdown
   - **Who can trigger the flow**: Anyone
   - Request Body JSON Schema: Leave empty (GET requests don't have a body)

### Step 3: Add SharePoint Action

1. Click **+ New step**
2. Search for "Get items" (SharePoint)
3. Configure:
   - **Site Address**: Select your SharePoint site
   - **List Name**: Select your "Laptop Loans" list (or whatever you named it)
   - **Order By**: `Created` or `ID` (optional)
   - **Top Count**: Leave empty to get all, or set a limit like 100

### Step 4: Add Response Action

1. Click **+ New step**
2. Search for "Response" (Request)
3. Configure:
   - **Status Code**: 200
   - **Body**: Click in the body field and switch to code view (click the `</>` icon)
   - Paste this JSON:

```json
{
  "ok": true,
  "loans": @{outputs('Get_items')?['body/value']},
  "count": @{length(outputs('Get_items')?['body/value'])}
}
```

### Step 5: Map SharePoint Columns (Optional - if you need to transform data)

If your SharePoint column names are different, add a **Select** action between Get items and Response:

1. Click **+ New step** (between Get items and Response)
2. Search for "Select" (Data Operations)
3. **From**: Select `value` from Get items dynamic content
4. **Map**: Click "Enter key" and map your SharePoint columns:

Example mapping:

```
id: ID
clientName: Title or ClientName
clientEmail: ClientEmail
program: Program
equipmentLoanDate: EquipmentLoanDate
agreedEquipmentReturnDate: AgreedEquipmentReturnDate
selectedApprover: SelectedApprover
developmentOfficerName: DevelopmentOfficerName
courseName: CourseName
```

Then in Response body, use:

```json
{
  "ok": true,
  "loans": @{body('Select')},
  "count": @{length(body('Select'))}
}
```

### Step 6: Save and Get URL

1. Click **Save** at the top
2. Expand the HTTP trigger
3. Copy the **HTTP GET URL**
4. It will look like:
   ```
   https://prod-xx.westeurope.logic.azure.com:443/workflows/abc.../triggers/manual/paths/invoke?api-version=2016&sp=...&sv=1.0&sig=...
   ```

### Step 7: Add to Environment Variables

1. Open your `.env.local` file
2. Add the new variable:

```env
PA_FLOW_URL=your-submit-flow-url
PA_LOANS_LIST_URL=your-get-loans-flow-url-here
FORM_SECRET_KEY=your-secret-key
```

### Step 8: Test

1. Save your `.env.local` file
2. Restart your Next.js dev server: `npm run dev`
3. Navigate to the "Loan List" page
4. You should see your SharePoint loan data displayed in the table

## Troubleshooting

- **No data showing**: Check browser console and Power Automate run history
- **Wrong column names**: Verify SharePoint column names match your mapping
- **403/401 errors**: Ensure "Who can trigger" is set to "Anyone" in the HTTP trigger
- **Empty array**: Check if your SharePoint list has any items

## SharePoint List Columns

The actual SharePoint list column structure (as returned by Power Automate):

**Required Fields:**

- **ID** (Number) - Auto-generated SharePoint ID
- **ClientName** (Single line of text) - Name of the client
- **DevelopmentOfficerName** (Single line of text) - Officer handling the loan
- **DevelopmentOfficerEmail** (Single line of text) - Officer's email
- **Program** (Choice or Single line of text) - Program name (e.g., "sicap-employment")
- **CourseName** (Single line of text) - Name of the course
- **CourseProvider** (Single line of text) - Provider of the course
- **Equipmentloandate** (Date and Time) - Loan start date (note: lowercase 'l')
- **Agreedequipmentreturndate** (Date and Time) - Expected return date (note: lowercase 'r')
- **SelectedApprover** (Single line of text) - Approver's email
- **IdentityandStatus** (Choice) - Loan status with Value property

**Optional Fields:**

- **ClientAddress** (Multiple lines of text) - Client's address
- **ClientEmail** (Single line of text) - Client's email address
- **CourseDuration** (Single line of text) - Duration of the course (e.g., "6 months")
- **CourseQualification** (Single line of text) - Qualification obtained
- **AdditionalNotes** (Multiple lines of text) - Additional notes or comments
- **MakeandModelofDevice** (Single line of text) - Equipment make and model
- **SerialNumber** (Single line of text) - Device serial number
- **ItemsIncluded** (Multiple lines of text) - Items included with the loan
- **NameDOCollectingEquipment** (Single line of text) - Name of collecting officer
- **NameSecadITAssistant** (Single line of text) - Name of IT assistant issuing equipment

**Note:** Field names are case-sensitive and match SharePoint internal names exactly.
