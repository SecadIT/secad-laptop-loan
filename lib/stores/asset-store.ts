import { create } from 'zustand';
import { fetchApi } from '@/lib/api-client';

export interface AssetRecord {
  ID: number;
  ItemInternalId: string;
  Status: {
    Id: number;
    Value: string;
  };
  Manufacturer: {
    Id: number;
    Value: string;
  };
  AssetType: {
    Id: number;
    Value: string;
  };
  Color: {
    Id: number;
    Value: string;
  };
  SerialNumber: string;
  Condition?: {
    Id: number;
    Value: string;
  };
  ConditionNotes?: string;
  AssignedLoanId?: string;
  Modified: string;
  Created: string;
  Author: {
    DisplayName: string;
    Email: string;
    Department?: string;
  };
  Editor: {
    DisplayName: string;
    Email: string;
    Department?: string;
  };
}

interface AssetStore {
  assets: AssetRecord[];
  loading: boolean;
  error: string;
  lastFetched: number | null;
  fetchAssets: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  loading: false,
  error: '',
  lastFetched: null,

  fetchAssets: async (force = false) => {
    const state = get();

    // Check if we have fresh data and don't need to refetch
    if (
      !force &&
      state.lastFetched &&
      Date.now() - state.lastFetched < CACHE_DURATION &&
      state.assets.length > 0
    ) {
      return;
    }

    try {
      set({ loading: true, error: '' });

      const response = await fetchApi('/api/assets', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();

      set({
        assets: data.assets || [],
        loading: false,
        lastFetched: Date.now(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load asset data',
        loading: false,
      });
      console.error('Error fetching assets:', err);
    }
  },

  reset: () => set({ assets: [], loading: false, error: '', lastFetched: null }),
}));
