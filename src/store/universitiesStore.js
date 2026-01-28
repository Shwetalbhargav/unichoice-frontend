import { create } from "zustand";
import {
  searchUniversities,
  universitiesFromOnboarding,
  getUniversityById,
} from "../services/api";

const useUniversitiesStore = create((set, get) => ({
  searchResults: [],
  fromOnboarding: { dream: [], target: [], safe: [], raw: null },
  byId: {},

  loading: false,
  error: null,

  search: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await searchUniversities(params);
      set({ searchResults: res.data?.items || res.data || [] });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "University search failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchFromOnboarding: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await universitiesFromOnboarding(params);

      // Accept any backend shape; try to normalize if possible
      const raw = res.data;
      const normalized = {
        dream: raw?.dream || raw?.DREAM || [],
        target: raw?.target || raw?.TARGET || [],
        safe: raw?.safe || raw?.SAFE || [],
        raw,
      };

      set({ fromOnboarding: normalized });
      return raw;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "From onboarding failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (universityId) => {
    const existing = get().byId[universityId];
    if (existing) return existing;

    set({ loading: true, error: null });
    try {
      const res = await getUniversityById(universityId);
      set((s) => ({ byId: { ...s.byId, [universityId]: res.data } }));
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Get university failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ searchResults: [], fromOnboarding: { dream: [], target: [], safe: [], raw: null }, byId: {} }),
}));

export default useUniversitiesStore;
