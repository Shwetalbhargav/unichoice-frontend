// onboardingStore.js
import { create } from "zustand";
import { getMyOnboarding, saveOnboarding } from "../services/api";

const useOnboardingStore = create((set, get) => ({
  onboarding: null,
  loading: false,
  error: null,

  // ✅ backend truth = completedAt
  isComplete: () => Boolean(get().onboarding?.completedAt),

  fetchMyOnboarding: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMyOnboarding();

      // ✅ handle success wrapper + null payload
      const onboarding = res?.data?.data ?? res?.data ?? null;

      set({ onboarding });
      return onboarding;
    } catch (e) {
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

      // ✅ handle success wrapper
      const onboarding = res?.data?.data ?? res?.data ?? null;

      set({ onboarding });
      return onboarding;
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
