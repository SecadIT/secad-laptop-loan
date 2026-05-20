import { useMemo } from 'react';
import { useLoanStore, type LoanRecord } from './loan-store';
import { useAssetStore, type AssetRecord } from './asset-store';

export interface ClientRecord {
  id: string; // Unique identifier (clientName-email combination)
  clientName: string;
  clientEmail: string;
  program: string;
  course: string;
  courseProvider: string;
  loanStatus: string;
  loanId: number;
  loanDate: string;
  returnDate: string;
  officer: string;
  // Asset information
  assetTitle?: string;
  assetSerialNumber?: string;
  assetStatus?: string;
  assetProgram?: string;
  assetManufacturer?: string;
  assetCondition?: string;
  assetId?: number;
}

/**
 * Hook to get combined client data from loans and assets
 * Matches loans with assets based on SerialNumber or AssignedLoanId
 */
export function useClientData(): ClientRecord[] {
  const { loans } = useLoanStore();
  const { assets } = useAssetStore();

  const clients = useMemo(() => {
    const clientRecords: ClientRecord[] = [];

    // Create a map of assets by serial number and loan ID for quick lookup
    const assetsBySerial = new Map<string, AssetRecord>();
    const assetsByLoanId = new Map<string, AssetRecord>();

    assets.forEach((asset) => {
      if (asset.SerialNumber) {
        assetsBySerial.set(asset.SerialNumber.toLowerCase(), asset);
      }
      if (asset.AssignedLoanId) {
        assetsByLoanId.set(asset.AssignedLoanId, asset);
      }
    });

    // Process each loan and try to match with an asset
    loans.forEach((loan) => {
      // Find matching asset by serial number or loan ID
      let matchedAsset: AssetRecord | undefined;

      if (loan.SerialNumber) {
        matchedAsset = assetsBySerial.get(loan.SerialNumber.toLowerCase());
      }

      if (!matchedAsset) {
        matchedAsset = assetsByLoanId.get(loan.ID.toString());
      }

      const clientRecord: ClientRecord = {
        id: `loan-${loan.ID}`,
        clientName: loan.ClientName,
        clientEmail: loan.ClientEmail || 'N/A',
        program: loan.Program,
        course: loan.CourseName,
        courseProvider: loan.CourseProvider,
        loanStatus: loan.IdentityandStatus?.Value || 'Unknown',
        loanId: loan.ID,
        loanDate: loan.Equipmentloandate,
        returnDate: loan.Agreedequipmentreturndate,
        officer: loan.DevelopmentOfficerName,
        // Asset data if matched
        assetTitle: matchedAsset?.Title,
        assetSerialNumber: matchedAsset?.SerialNumber,
        assetStatus: matchedAsset?.Status?.Value,
        assetProgram: matchedAsset?.OwnerProgram?.Value,
        assetManufacturer: matchedAsset?.Manufacturer?.Value,
        assetCondition: matchedAsset?.Condition?.Value,
        assetId: matchedAsset?.ID,
      };

      clientRecords.push(clientRecord);
    });

    return clientRecords;
  }, [loans, assets]);

  return clients;
}
