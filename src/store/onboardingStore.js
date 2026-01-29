// src/store/onboardingStore.js
import { create } from "zustand";
import { getMyOnboarding, saveOnboarding } from "../services/api";

const useOnboardingStore = create((set, get) => ({
  onboarding: null,
  loading: false,
  error: null,

  /**
   * ✅ Single source of truth for completion
   * Backend sets completedAt
   */
  isComplete: () => Boolean(get().onboarding?.completedAt),

  /**
   * Fetch onboarding profile of logged-in user
   */
  fetchMyOnboarding: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMyOnboarding();

      // backend returns { success, message, data }
      const onboarding = res?.data?.data ?? null;

      set({ onboarding });
      return onboarding;
    } catch (e) {
      set({
        error:
          e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to fetch onboarding",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Save (upsert) onboarding profile
   * Payload must already match Prisma schema
   */
  save: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await saveOnboarding(payload);

      const onboarding = res?.data?.data ?? null;
      set({ onboarding });

      return onboarding;
    } catch (e) {
      set({
        error:
          e?.response?.data?.message ||
          e?.response?.data ||
          e?.message ||
          "Failed to save onboarding",
      });
      throw e; // let UI handle step errors
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ onboarding: null, error: null }),
}));

export default useOnboardingStore;
