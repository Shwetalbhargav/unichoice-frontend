import { create } from "zustand";
import { getMyOnboarding, saveOnboarding } from "../services/api";

const useOnboardingStore = create((set, get) => ({
  onboarding: null,
  loading: false,
  error: null,

  isComplete: () => Boolean(get().onboarding),

  fetchMyOnboarding: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMyOnboarding();
      set({ onboarding: res.data });
      return res.data;
    } catch (e) {
      // if backend returns 404/no onboarding, treat as not completed
      if (e?.response?.status === 404) {
        set({ onboarding: null });
        return null;
      }
      set({ error: e?.response?.data || e?.message || "Fetch onboarding failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  save: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await saveOnboarding(payload);
      set({ onboarding: res.data });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Save onboarding failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ onboarding: null }),
}));

export default useOnboardingStore;
