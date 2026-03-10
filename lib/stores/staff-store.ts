import { create } from 'zustand';

export interface StaffMember {
  ID: number;
  User: {
    DisplayName: string;
    Email: string;
    Claims: string;
  };
  Role: {
    Value: string;
    Id: number;
  };
  Active: boolean;
}

interface StaffStore {
  staff: StaffMember[];
  loading: boolean;
  error: string;
  lastFetched: number | null;
  fetchStaff: (force?: boolean) => Promise<void>;
  getStaffByRole: (role: string) => StaffMember[];
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useStaffStore = create<StaffStore>((set, get) => ({
  staff: [],
  loading: false,
  error: '',
  lastFetched: null,

  fetchStaff: async (force = false) => {
    const state = get();

    // Check if we have fresh data and don't need to refetch
    if (
      !force &&
      state.lastFetched &&
      Date.now() - state.lastFetched < CACHE_DURATION &&
      state.staff.length > 0
    ) {
      return;
    }

    try {
      set({ loading: true, error: '' });

      const response = await fetch('/api/staff', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();

      set({
        staff: data.staff || [],
        loading: false,
        lastFetched: Date.now(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load staff data',
        loading: false,
      });
      console.error('Error fetching staff:', err);
    }
  },

  getStaffByRole: (role: string) => {
    const state = get();
    return state.staff.filter((member) => member.Role?.Value === role && member.Active);
  },

  reset: () => set({ staff: [], loading: false, error: '', lastFetched: null }),
}));
