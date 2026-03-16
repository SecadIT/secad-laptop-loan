'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { LoanRecord } from '@/lib/stores/loan-store';

interface DownloadLoanPdfProps {
  loan: LoanRecord;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  className?: string;
}

export function DownloadLoanPdf({ loan, variant = 'default', className }: DownloadLoanPdfProps) {
  function formatDate(dateString: string) {
    try {
      return new Date(dateString).toLocaleDateString('en-IE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  function downloadPdf() {
    // Get the absolute URL for the logo
    const logoUrl = `${window.location.origin}/branding/SECAD Logo (Classic).jpg`;

    // Create HTML content for the PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Loan Record - ${loan.ID}</title>
  <style>
    body {
      font-family: Tahoma, Verdana, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header-content {
      flex: 1;
    }
    .header-logo {
      margin-left: 20px;
    }
    .header-logo img {
      max-width: 150px;
      height: auto;
    }
    .header h1 {
      color: #1e40af;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #64748b;
      margin: 5px 0 0 0;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      background-color: #dbeafe;
      color: #1e40af;
      padding: 10px 15px;
      font-size: 18px;
      font-weight: bold;
      border-left: 4px solid #2563eb;
      margin-bottom: 15px;
    }
    .field-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .field {
      margin-bottom: 15px;
    }
    .field-label {
      font-weight: bold;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .field-value {
      color: #1e293b;
      font-size: 14px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: left;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 0;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <h1>Laptop Loan Record</h1>
      <p>Generated on ${new Date().toLocaleString('en-IE')}</p>
      <p>Loan ID: ${loan.ID}</p>
    </div>
    <div class="header-logo">
      <img src="${logoUrl}" alt="SECAD Logo" />
    </div>
  </div>

  <div class="section">
    <div class="section-title">Client Information</div>
    <div class="field-group">
      <div class="field">
        <div class="field-label">Client Name</div>
        <div class="field-value">${loan.ClientName || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Client Email</div>
        <div class="field-value">${loan.ClientEmail || 'N/A'}</div>
      </div>
      <div class="field full-width">
        <div class="field-label">Client Address</div>
        <div class="field-value">${loan.ClientAddress || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Program Information</div>
    <div class="field-group">
      <div class="field">
        <div class="field-label">Program</div>
        <div class="field-value">${loan.Program || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Course Name</div>
        <div class="field-value">${loan.CourseName || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Course Provider</div>
        <div class="field-value">${loan.CourseProvider || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Course Qualification</div>
        <div class="field-value">${loan.CourseQualification || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Course Duration</div>
        <div class="field-value">${loan.CourseDuration || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Loan Details</div>
    <div class="field-group">
      <div class="field">
        <div class="field-label">Development Officer</div>
        <div class="field-value">${loan.DevelopmentOfficerName || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Development Officer Email</div>
        <div class="field-value">${loan.DevelopmentOfficerEmail || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Approved By</div>
        <div class="field-value">${loan.SelectedApprover || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Equipment Loan Date</div>
        <div class="field-value">${formatDate(loan.Equipmentloandate)}</div>
      </div>
      <div class="field">
        <div class="field-label">Agreed Return Date</div>
        <div class="field-value">${formatDate(loan.Agreedequipmentreturndate)}</div>
      </div>
    </div>
  </div>

  ${
    loan.MakeandModelofDevice
      ? `
  <div class="section">
    <div class="section-title">Equipment Information</div>
    <div class="field-group">
      <div class="field">
        <div class="field-label">Make and Model</div>
        <div class="field-value">${loan.MakeandModelofDevice || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Serial Number</div>
        <div class="field-value">${loan.SerialNumber || 'N/A'}</div>
      </div>
      <div class="field full-width">
        <div class="field-label">Items Included</div>
        <div class="field-value">${loan.ItemsIncluded || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">DO Collecting Equipment</div>
        <div class="field-value">${loan.NameDOCollectingEquipment || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">SECAD IT Assistant</div>
        <div class="field-value">${loan.NameSecadITAssistant || 'N/A'}</div>
      </div>
    </div>
  </div>
  `
      : ''
  }

  ${
    loan.AdditionalNotes
      ? `
  <div class="section">
    <div class="section-title">Additional Notes</div>
    <div class="field">
      <div class="field-value">${loan.AdditionalNotes}</div>
    </div>
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>This is an official record from SECAD Laptop Loan System</p>
    <p>Document generated automatically - no signature required</p>
  </div>
</body>
</html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Close after printing (optional)
        // printWindow.close();
      };
    } else {
      alert('Please allow pop-ups to download the PDF');
    }
  }

  return (
    <Button variant={variant} onClick={downloadPdf} className={className}>
      <Download className="mr-2 h-4 w-4" />
      Print PDF
    </Button>
  );
}
