import { create } from 'zustand';

export interface LoanRecord {
  ID: number;
  ClientName: string;
  ClientEmail?: string;
  ClientAddress?: string;
  DevelopmentOfficerEmail: string;
  DevelopmentOfficerName: string;
  Program: string;
  CourseName: string;
  CourseProvider: string;
  CourseDuration?: string;
  CourseQualification?: string;
  Equipmentloandate: string;
  Agreedequipmentreturndate: string;
  SelectedApprover: string;
  AdditionalNotes?: string;
  IdentityandStatus?: {
    Value: string;
  };
  // Equipment details (from issue form)
  MakeandModelofDevice?: string;
  SerialNumber?: string;
  ItemsIncluded?: string;
  NameDOCollectingEquipment?: string;
  NameSecadITAssistant?: string;
  // Signature data
  SignatureImage?: string;
}

interface LoanStore {
  loans: LoanRecord[];
  loading: boolean;
  error: string;
  lastFetched: number | null;
  fetchLoans: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useLoanStore = create<LoanStore>((set, get) => ({
  loans: [],
  loading: false,
  error: '',
  lastFetched: null,

  fetchLoans: async (force = false) => {
    const state = get();

    // Check if we have fresh data and don't need to refetch
    if (
      !force &&
      state.lastFetched &&
      Date.now() - state.lastFetched < CACHE_DURATION &&
      state.loans.length > 0
    ) {
      return;
    }

    try {
      set({ loading: true, error: '' });

      const response = await fetch('/api/loans', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }

      const data = await response.json();

      set({
        loans: data.loans || [],
        loading: false,
        lastFetched: Date.now(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load loan data',
        loading: false,
      });
      console.error('Error fetching loans:', err);
    }
  },

  reset: () => set({ loans: [], loading: false, error: '', lastFetched: null }),
}));
